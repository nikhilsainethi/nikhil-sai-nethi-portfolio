import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Mesh,
  Object3D,
  ShaderMaterial,
  type IUniform,
} from "three";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AISLE } from "@/lib/datacentre-scene";

/** Pieces shared by the hero aisle and the story diorama. */

export type Uniforms = Record<string, IUniform>;

/** Loads public/models/datacentre.glb (meshopt-compressed, built by tools/blender). */
export async function loadDatacentreModel(url: string) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url);
  gltf.scene.updateMatrixWorld(true);
  return gltf.scene;
}

export function childMeshes(root: Object3D) {
  const meshes: Mesh[] = [];
  root.traverse((child) => {
    if ((child as Mesh).isMesh) meshes.push(child as Mesh);
  });
  return meshes;
}

/** Seeded pseudo-random number in 0..1, so a scene is identical on every visit. */
export function seeded(index: number) {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export function fogUniforms(color: number, density: number): Uniforms {
  return { uFogColor: { value: new Color(color) }, uFogDensity: { value: density } };
}
export const FOG_VERTEX = /* glsl */ `vFogDepth = -mvPosition.z;`;
export const FOG_FRAGMENT = /* glsl */ `
  float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * vFogDepth * vFogDepth);
  gl_FragColor.rgb *= 1.0 - fogFactor;`;
/** No-ops when drawing into the post-processing buffer; applied when drawing straight to screen. */
export const OUTPUT_FRAGMENT = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>`;

/**
 * Cabinet LEDs. Per vertex: `color` = LED colour, `uv.x` = blink mode
 * (0 steady, .5 breathing, 1 activity flicker), `uv.y` = phase.
 * Per instance: `aSeed`, and `aAlert` = 1 for the cabinet under investigation.
 * Uniforms: uTime, uBoot, uInvestigation, uRecovery, uFocus (dims other cabinets).
 */
export function ledMaterial(shared: Uniforms, fog: Uniforms) {
  return new ShaderMaterial({
    side: DoubleSide,
    uniforms: { ...shared, ...fog },
    vertexShader: /* glsl */ `
      attribute vec3 color;
      attribute float aSeed;
      attribute float aAlert;
      uniform float uTime, uBoot, uInvestigation, uRecovery, uFocus;
      varying vec3 vColor;
      varying float vFogDepth;
      void main() {
        vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vec4 mvPosition = viewMatrix * world;
        float phase = uv.y + aSeed;
        float breathe = 0.55 + 0.45 * sin(uTime * 1.7 + phase * 6.2831);
        float tick = floor(uTime * (4.0 + 7.0 * fract(phase * 7.13)) + phase * 91.7);
        float flicker = step(0.4, fract(sin(tick * 12.9898 + phase * 78.233) * 43758.5453));
        float level = uv.x < 0.25 ? 1.0 : (uv.x < 0.75 ? breathe : 0.12 + 0.88 * flicker);
        vec3 tint = color;
        float investigating = aAlert * uInvestigation;
        float recovered = aAlert * uRecovery;
        tint = mix(tint, vec3(1.0, 0.5, 0.1), investigating);
        level = mix(level, 0.55 + 0.45 * sin(uTime * 8.0 + phase * 3.0), investigating * 0.85);
        tint = mix(tint, vec3(0.5, 1.0, 0.42), recovered);
        level = mix(level, 1.0, recovered);
        level *= mix(1.0, 0.3 + 0.7 * aAlert, uFocus);
        // Power-on sweep: cabinets wake up from the camera towards the door.
        float along = (${AISLE.rowStartZ.toFixed(2)} - world.z) / ${(AISLE.rowStartZ - AISLE.rowEndZ).toFixed(2)};
        float powered = smoothstep(0.0, 0.12, uBoot * 1.25 - along - 0.08 * fract(phase * 3.7));
        vColor = tint * level * powered * 2.6;
        gl_Position = projectionMatrix * mvPosition;
        ${FOG_VERTEX}
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      varying vec3 vColor;
      varying float vFogDepth;
      void main() {
        gl_FragColor = vec4(vColor, 1.0);
        ${FOG_FRAGMENT}
        ${OUTPUT_FRAGMENT}
      }`,
  });
}

/**
 * Outline + scan line drawn over the front of the investigated cabinet.
 * `width`/`height` are the panel size in metres (keeps the border a constant thickness).
 */
export function alertPanelMaterial(shared: Uniforms, width: number, height: number) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms: shared,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uInvestigation, uRecovery;
      varying vec2 vUv;
      void main() {
        vec2 edge = min(vUv, 1.0 - vUv) * vec2(${width.toFixed(3)}, ${height.toFixed(3)});   // metres from the border
        float border = 1.0 - smoothstep(0.006, 0.014, min(edge.x, edge.y));
        float corner = (1.0 - smoothstep(0.0, 0.11, edge.x)) * (1.0 - smoothstep(0.0, 0.11, edge.y));
        float sweep = fract(uTime * 0.45);
        float scan = (1.0 - smoothstep(0.0, 0.035, abs(vUv.y - sweep))) * uInvestigation;
        float fill = 0.05 + 0.03 * sin(vUv.y * 190.0);
        vec3 amber = vec3(1.0, 0.56, 0.16);
        vec3 green = vec3(0.56, 1.0, 0.5);
        float strength = max(uInvestigation, uRecovery * 0.75);
        vec3 color = mix(amber, green, clamp(uRecovery * 1.4, 0.0, 1.0));
        float shape = border * 1.6 + corner * 1.2 + scan * 0.9 + fill;
        gl_FragColor = vec4(color * shape * strength * 1.6, 1.0);
        ${OUTPUT_FRAGMENT}
      }`,
  });
}
