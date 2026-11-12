import { DoubleSide, Group, MeshStandardMaterial, ShaderMaterial } from "three";
import { FOG_FRAGMENT, FOG_VERTEX, OUTPUT_FRAGMENT, childMeshes } from "../shared";
import { addBaked, glowMaterial, takeNode, type Frame, type Part, type WorldContext } from "./context";

/** The passage from the aisle to the core: ribs of light that pulse towards the core. */
export function buildTunnel(context: WorldContext): Part {
  const { scene, shared, fog, track } = context;
  const group = new Group();
  scene.add(group);
  addBaked(context, group, "Tunnel", 0.4);

  const rings = track(
    new ShaderMaterial({
      side: DoubleSide,
      uniforms: { ...shared, ...fog },
      vertexShader: /* glsl */ `
        attribute vec3 color;
        uniform float uTime;
        varying float vLevel;
        varying float vFogDepth;
        void main() {
          // color.r is the rib's position along the tunnel: 0 at the aisle, 1 at the core.
          float wave = fract(uTime * 0.2 - color.r * 1.15);
          float pulse = smoothstep(0.72, 1.0, wave) + 0.3 * (1.0 - smoothstep(0.0, 0.3, wave));
          vLevel = 0.3 + 1.9 * pulse;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          ${FOG_VERTEX}
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uFogColor;
        uniform float uFogDensity, uAlert;
        varying float vLevel;
        varying float vFogDepth;
        void main() {
          vec3 tint = mix(vec3(0.5, 0.92, 1.0), vec3(1.0, 0.42, 0.26), uAlert);
          gl_FragColor = vec4(tint * vLevel, 1.0);
          ${FOG_FRAGMENT}
          ${OUTPUT_FRAGMENT}
        }`,
    }),
  );
  const glowNode = takeNode(context, "TunnelGlow");
  for (const mesh of childMeshes(glowNode)) {
    const source = mesh.material as MeshStandardMaterial;
    track(mesh.geometry);
    mesh.material = source.name === "tunnel_ring" ? rings : glowMaterial(context, source.emissive, 1.1).material;
  }
  glowNode.removeFromParent();
  group.add(glowNode);

  return {
    update({ pose }: Frame) {
      group.visible = pose.u > 0.9 && pose.u < 8.4;
    },
  };
}
