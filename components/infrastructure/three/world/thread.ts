import {
  AdditiveBlending,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PointLight,
  ShaderMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { CORE_CENTRE_Z, PLATFORMS, TUNNEL_END_Z, TUNNEL_START_Z, WORLD } from "@/lib/world-layout";
import { stopIndex } from "@/lib/world-path";
import { FOG_FRAGMENT, FOG_VERTEX, OUTPUT_FRAGMENT, type Uniforms } from "../shared";
import type { Frame, Part, WorldContext } from "./context";

/**
 * One signal, followed from the aisle to the sky: a thread of light that runs
 * the whole route, and a packet on it that keeps just ahead of the camera.
 */

function threadCurve() {
  const points: Vector3[] = [];
  points.push(new Vector3(0, 2.44, TUNNEL_START_Z + 0.45), new Vector3(0, 2.46, TUNNEL_START_Z - 0.1));
  for (let z = TUNNEL_START_Z - 1; z > TUNNEL_END_Z; z -= 2) points.push(new Vector3(0, 2.5, z));
  // down the portal to the bridge's left handrail, along it, then up onto the spine
  const spineFace = CORE_CENTRE_Z + WORLD.core.spineRadius + 0.08;
  const rail = -1.06;
  points.push(
    new Vector3(-0.85, 2.44, TUNNEL_END_Z + 0.5),
    new Vector3(rail, 1.7, TUNNEL_END_Z - 0.3),
    new Vector3(rail, 1.1, TUNNEL_END_Z - 1.1),
    new Vector3(rail, 1.1, (TUNNEL_END_Z + spineFace) / 2),
    new Vector3(rail, 1.1, spineFace + 1.9),
    new Vector3(-0.55, 1.5, spineFace + 0.7),
    new Vector3(0, 2.3, spineFace),
  );
  // three turns up around the spine
  const radius = WORLD.core.spineRadius + 0.075;
  const top = WORLD.roof.underside - 1.3;
  const steps = 72;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = t * Math.PI * 6;
    points.push(new Vector3(radius * Math.sin(angle), 2.6 + (top - 2.6) * t, CORE_CENTRE_Z + radius * Math.cos(angle)));
  }
  // in to the emitter, then straight up
  points.push(new Vector3(0, top + 1.3, CORE_CENTRE_Z), new Vector3(0, top + 12, CORE_CENTRE_Z), new Vector3(0, top + 70, CORE_CENTRE_Z));
  return new CatmullRomCurve3(points, false, "centripetal");
}

export function buildThread(context: WorldContext): Part {
  const { scene, shared, fog, track } = context;
  const curve = threadCurve();
  const SAMPLES = 800;
  const samples = curve.getSpacedPoints(SAMPLES);
  const first = (test: (point: Vector3) => boolean, from = 0) => {
    for (let i = Math.round(from * SAMPLES); i <= SAMPLES; i += 1) if (test(samples[i])) return i / SAMPLES;
    return 1;
  };
  const radial = (point: Vector3) => Math.hypot(point.x, point.z - CORE_CENTRE_Z);
  const mouth = first((p) => p.z < TUNNEL_END_Z);
  const spine = first((p) => radial(p) < WORLD.core.spineRadius + 0.2);
  const atHeight = (height: number) => first((p) => p.y > height, spine);
  const roofTop = WORLD.roof.top;
  // where the packet is for each stop of the camera route (lib/world-path)
  const schedule: [number, number][] = (
    [
      ["hero", 0],
      ["approach", 0],
      ["threshold", mouth * 0.2],
      ["tunnel-in", mouth * 0.45],
      ["tunnel-mid", mouth * 0.8],
      ["tunnel-out", mouth + (spine - mouth) * 0.25],
      ["core-reveal", mouth + (spine - mouth) * 0.7],
      ["core-rise", atHeight(4.5)],
      ["exhibit-1", atHeight(PLATFORMS[0].height + 3)],
      ["exhibit-2", atHeight(PLATFORMS[1].height + 3)],
      ["exhibit-3", atHeight(PLATFORMS[2].height + 3)],
      ["exhibit-4", atHeight(PLATFORMS[3].height + 3)],
      ["control-ring", atHeight(roofTop - 2.5)],
      ["oculus", atHeight(roofTop + 3)],
      ["above-oculus", atHeight(roofTop + 7)],
      ["roof-a", atHeight(roofTop + 10)],
      ["roof-b", atHeight(roofTop + 16)],
      ["beacon", atHeight(roofTop + 44)],
    ] as const
  ).map(([name, fraction]) => [stopIndex(name), fraction]);
  const fractionAt = (u: number) => {
    for (let i = 1; i < schedule.length; i += 1) {
      const [u0, f0] = schedule[i - 1];
      const [u1, f1] = schedule[i];
      if (u <= u1) return f0 + ((f1 - f0) * Math.max(0, u - u0)) / (u1 - u0);
    }
    return schedule[schedule.length - 1][1];
  };

  const uniforms: Uniforms = { ...shared, ...fog, uHead: { value: 0 } };
  const material = track(
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
      uniforms,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying float vFogDepth;
        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          ${FOG_VERTEX}
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime, uHead, uAlert, uFogDensity;
        uniform vec3 uFogColor;
        varying vec2 vUv;
        varying float vFogDepth;
        void main() {
          float travel = fract(vUv.x * 60.0 - uTime * 0.5);
          float pulse = smoothstep(0.9, 1.0, travel);
          float head = exp(-abs(vUv.x - uHead) * 220.0);
          vec3 tint = mix(vec3(0.62, 1.0, 0.7), vec3(1.0, 0.36, 0.24), uAlert);
          // dim behind the packet, brighter ahead: there is always somewhere to go
          float ahead = 0.3 + 0.5 * smoothstep(uHead - 0.01, uHead + 0.03, vUv.x);
          gl_FragColor = vec4(tint * (ahead + 1.2 * pulse + 4.0 * head), 1.0);
          ${FOG_FRAGMENT}
          ${OUTPUT_FRAGMENT}
        }`,
    }),
  );
  const tube = new Mesh(track(new TubeGeometry(curve, 900, 0.008, 6, false)), material);
  tube.frustumCulled = false;
  scene.add(tube);

  const tint = new Color(0.72, 1.0, 0.62);
  const alarm = new Color(1.0, 0.36, 0.24);
  const packetMaterial = track(new MeshBasicMaterial({ color: tint.clone().multiplyScalar(3.2) }));
  const packet = new Mesh(track(new SphereGeometry(0.055, 16, 12)), packetMaterial);
  const light = new PointLight(tint, 2.4, 7, 1.7);
  packet.add(light);
  scene.add(packet);
  const position = new Vector3();

  return {
    update({ pose, alert }: Frame) {
      const fraction = fractionAt(pose.u);
      uniforms.uHead.value = fraction;
      curve.getPointAt(Math.min(1, fraction), position);
      packet.position.copy(position);
      packet.visible = pose.u > 0.6;
      packetMaterial.color.copy(tint).lerp(alarm, alert).multiplyScalar(3.2);
      light.color.copy(tint).lerp(alarm, alert);
      tube.visible = pose.u > 0.3;
    },
  };
}
