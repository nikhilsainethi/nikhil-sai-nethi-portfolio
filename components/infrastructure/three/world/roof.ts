import {
  AdditiveBlending,
  BackSide,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  DynamicDrawUsage,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from "three";
import { CORE_CENTRE_Z, WORLD } from "@/lib/world-layout";
import { FOG_FRAGMENT, FOG_VERTEX, OUTPUT_FRAGMENT, childMeshes, seeded, type Uniforms } from "../shared";
import { addBaked, glowMaterial, takeNode, type Frame, type Part, type WorldContext } from "./context";

/** Above the machine: the roof, the night sky, a city on the horizon, and the signal leaving as a beam. */

const EMITTER_Y = WORLD.roof.underside - 0.05;
const BEAM_HEIGHT = 190;

function skyMaterial(uniforms: Uniforms) {
  return new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    depthTest: false,
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vDirection;
      void main() {
        vDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uAlert;
      varying vec3 vDirection;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      void main() {
        vec3 d = normalize(vDirection);
        float up = clamp(d.y, -1.0, 1.0);
        // night gradient with a glow along the horizon
        vec3 zenith = vec3(0.006, 0.012, 0.035);
        vec3 horizon = vec3(0.03, 0.085, 0.11);
        vec3 color = mix(horizon, zenith, pow(clamp(up, 0.0, 1.0), 0.45));
        color += vec3(0.1, 0.2, 0.18) * exp(-abs(up) * 9.0) * 0.55;
        color = mix(color, vec3(0.008, 0.014, 0.02), smoothstep(0.0, -0.12, up));
        // stars: one per cell of a grid wrapped around the dome
        vec2 sphere = vec2(atan(d.z, d.x), asin(up));
        vec2 grid = sphere * vec2(150.0, 150.0);
        vec2 cell = floor(grid);
        float star = hash(cell);
        vec2 offset = fract(grid) - 0.5 - (vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5) * 0.6;
        float twinkle = 0.7 + 0.3 * sin(uTime * (0.8 + star * 2.0) + star * 40.0);
        float point = (1.0 - smoothstep(0.0, 0.11, length(offset))) * step(0.955, star) * twinkle;
        color += vec3(0.8, 0.92, 1.0) * point * smoothstep(0.02, 0.25, up) * 1.9;
        // aurora: slow curtains in the site's own greens
        float curtain = noise(vec2(sphere.x * 2.6 + uTime * 0.02, uTime * 0.035));
        float band = smoothstep(0.1, 0.32, up) * (1.0 - smoothstep(0.34, 0.74, up));
        float rays = 0.55 + 0.45 * noise(vec2(sphere.x * 26.0, up * 3.0 - uTime * 0.05));
        vec3 aurora = mix(vec3(0.2, 0.95, 0.7), vec3(0.75, 1.0, 0.45), noise(vec2(sphere.x * 1.4, 4.0)));
        aurora = mix(aurora, vec3(1.0, 0.3, 0.25), uAlert);
        color += aurora * band * rays * smoothstep(0.38, 0.8, curtain) * 0.34;
        gl_FragColor = vec4(color, 1.0);
        ${OUTPUT_FRAGMENT}
      }`,
  });
}

function beamMaterial(uniforms: Uniforms, core: boolean) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying float vFacing;
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normal);
        vFacing = abs(dot(n, normalize(-mvPosition.xyz)));
        gl_Position = projectionMatrix * mvPosition;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uAlert, uRestore;
      varying vec2 vUv;
      varying float vFacing;
      void main() {
        // brightest through the middle of the column, fading with height
        // max() guards: pow() of a value that interpolation pushed just below zero is
        // NaN, and a single NaN pixel spreads through the bloom pass as black blocks.
        float body = ${core ? "1.0" : "pow(max(vFacing, 0.0), 3.0)"};
        float flow = 0.72 + 0.28 * sin(vUv.y * 90.0 - uTime * 5.0 + sin(vUv.x * 6.2831) * 2.0);
        float fade = pow(max(1.0 - vUv.y, 0.0), 1.6) * smoothstep(0.0, 0.012, vUv.y);
        vec3 tint = mix(vec3(0.72, 1.0, 0.62), vec3(1.0, 0.32, 0.22), uAlert);
        tint = mix(tint, vec3(0.6, 1.0, 0.7), uRestore);
        gl_FragColor = vec4(tint * body * flow * fade * ${core ? "2.0" : "0.2"}, 1.0);
        ${OUTPUT_FRAGMENT}
      }`,
  });
}

function skylineMaterial(uniforms: Uniforms, fog: Uniforms) {
  return new ShaderMaterial({
    uniforms: { ...uniforms, ...fog },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      varying vec3 vLocal;
      varying vec3 vScale;
      varying vec3 vNormal;
      varying float vSeed;
      varying float vFogDepth;
      void main() {
        vLocal = position;
        vScale = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        vNormal = normal;
        vSeed = aSeed;
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        ${FOG_VERTEX}
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uFogDensity;
      uniform vec3 uFogColor;
      varying vec3 vLocal;
      varying vec3 vScale;
      varying vec3 vNormal;
      varying float vSeed;
      varying float vFogDepth;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
      void main() {
        vec3 color = vec3(0.012, 0.018, 0.024);
        if (abs(vNormal.y) < 0.5) {
          // windows: a grid in metres on each wall, a few of them lit
          float across = (abs(vNormal.x) > 0.5 ? vLocal.z * vScale.z : vLocal.x * vScale.x);
          vec2 grid = vec2(across / 2.1, vLocal.y * vScale.y / 3.0);
          vec2 cell = floor(grid);
          vec2 inside = fract(grid);
          float lit = step(0.86, hash(cell + vSeed * 91.0));
          float window = step(0.28, inside.x) * step(inside.x, 0.72) * step(0.34, inside.y) * step(inside.y, 0.66);
          vec3 glow = mix(vec3(1.0, 0.74, 0.42), vec3(0.55, 0.85, 1.0), step(0.6, hash(cell.yx + vSeed)));
          color += glow * lit * window * 0.6;
        }
        gl_FragColor = vec4(color, 1.0);
        ${FOG_FRAGMENT}
        ${OUTPUT_FRAGMENT}
      }`,
  });
}

export function buildRoof(context: WorldContext, camera: PerspectiveCamera): Part {
  const { scene, shared, fog, track } = context;
  const group = new Group();
  scene.add(group);
  addBaked(context, group, "Roof", 0.3);

  const mastLight = glowMaterial(context, new Color(1.0, 0.16, 0.1), 2.6);
  const glowNode = takeNode(context, "RoofGlow");
  for (const mesh of childMeshes(glowNode)) {
    const source = mesh.material as MeshStandardMaterial;
    track(mesh.geometry);
    mesh.material = source.name === "mast_light" ? mastLight.material : glowMaterial(context, source.emissive, source.name === "warm_light" ? 1.5 : 1.2).material;
  }
  glowNode.removeFromParent();
  group.add(glowNode);

  // ---- fans on the cooling units
  const slots: Vector3[] = [];
  context.model.traverse((node) => {
    if (/^FanSlot\d+$/.test(node.name)) slots.push(node.getWorldPosition(new Vector3()));
  });
  const fanMesh = childMeshes(takeNode(context, "Fan"))[0];
  const fanMaterial = track(fanMesh.material as MeshStandardMaterial);
  const fans = new InstancedMesh(track(fanMesh.geometry), fanMaterial, slots.length);
  fans.instanceMatrix.setUsage(DynamicDrawUsage);
  fans.frustumCulled = false;
  group.add(fans);
  const spin = new Matrix4();
  const place = new Matrix4();

  // ---- the beam: the signal leaving the building
  const beams = new Group();
  scene.add(beams);
  for (const [radius, core] of [[0.7, false], [0.13, true]] as const) {
    const geometry = track(new CylinderGeometry(radius * 1.5, radius, BEAM_HEIGHT, 28, 1, true));
    geometry.translate(0, BEAM_HEIGHT / 2, 0);
    const beam = new Mesh(geometry, track(beamMaterial(shared, core)));
    beam.position.set(0, EMITTER_Y, CORE_CENTRE_Z);
    beam.frustumCulled = false;
    beams.add(beam);
  }

  // ---- sky dome (follows the camera) and a city on the horizon
  const sky = new Mesh(track(new SphereGeometry(600, 48, 24)), track(skyMaterial(shared)));
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  scene.add(sky);

  const TOWERS = 150;
  const towerGeometry = track(new BoxGeometry(1, 1, 1));
  towerGeometry.translate(0, 0.5, 0);
  const seeds = new Float32Array(TOWERS);
  const towers = new InstancedMesh(towerGeometry, track(skylineMaterial(shared, fog)), TOWERS);
  const tower = new Matrix4();
  const scale = new Vector3();
  for (let i = 0; i < TOWERS; i += 1) {
    const angle = seeded(i * 3 + 11) * Math.PI * 2;
    const distance = 120 + 330 * Math.pow(seeded(i * 3 + 12), 0.8);
    const height = 30 + 120 * Math.pow(seeded(i * 3 + 13), 2.2) * (distance < 190 ? 0.5 : 1);
    scale.set(12 + 22 * seeded(i * 5 + 1), height, 12 + 22 * seeded(i * 5 + 2));
    tower.makeScale(scale.x, scale.y, scale.z).setPosition(Math.sin(angle) * distance, -34, CORE_CENTRE_Z + Math.cos(angle) * distance);
    towers.setMatrixAt(i, tower);
    seeds[i] = seeded(i + 50);
  }
  towerGeometry.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 1));
  towers.instanceMatrix.needsUpdate = true;
  towers.frustumCulled = false;
  scene.add(towers);

  return {
    update({ time, pose }: Frame) {
      const outside = pose.u > 15.2;
      group.visible = outside;
      towers.visible = outside;
      // The sky and beam are also seen from inside the core, up through the oculus.
      sky.visible = pose.u > 5.2;
      beams.visible = pose.u > 5.2;
      if (sky.visible) sky.position.copy(camera.position);
      if (!outside) return;
      mastLight.material.color.copy(mastLight.base).multiplyScalar(Math.sin(time * 2.1) > 0.3 ? 1 : 0.1);
      spin.makeRotationY(time * 5.5);
      slots.forEach((slot, i) => {
        place.makeTranslation(slot.x, slot.y, slot.z).multiply(spin).multiply(fanMesh.matrixWorld);
        fans.setMatrixAt(i, place);
      });
      fans.instanceMatrix.needsUpdate = true;
    },
  };
}
