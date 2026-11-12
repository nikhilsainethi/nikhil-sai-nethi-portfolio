import {
  AdditiveBlending,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  Points,
  ShaderMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { AISLE, INVESTIGATED_SLOT, parseSlotName, type Slot } from "@/lib/datacentre-scene";
import { WORLD } from "@/lib/world-layout";
import { FOG_FRAGMENT, FOG_VERTEX, OUTPUT_FRAGMENT, alertPanelMaterial, childMeshes, ledMaterial, seeded, type Uniforms } from "../shared";
import { addBaked, glowMaterial, instanced, setLedAttributes, takeNode, type Frame, type Part, type WorldContext } from "./context";

/** The hero: a cold aisle of cabinets that powers on, reports signals, and ends in sliding doors. */

function signalMaterial(shared: Uniforms, fog: Uniforms, offset: number) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms: { ...shared, ...fog, uOffset: { value: offset } },
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
      uniform float uTime, uTelemetry, uOffset;
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      varying vec2 vUv;
      varying float vFogDepth;
      void main() {
        float drawn = 1.0 - smoothstep(uTelemetry - 0.015, uTelemetry + 0.002, vUv.x);
        float head = smoothstep(uTelemetry - 0.06, uTelemetry, vUv.x) * drawn;
        float travel = fract(vUv.x * 2.2 - uTime * 0.16 + uOffset);
        float pulse = smoothstep(0.9, 1.0, travel) + 0.35 * smoothstep(0.55, 1.0, travel);
        vec3 teal = vec3(0.32, 0.95, 0.86);
        vec3 color = teal * (0.22 + 1.5 * pulse + 1.8 * head);
        gl_FragColor = vec4(color * drawn, 1.0);
        ${FOG_FRAGMENT}
        ${OUTPUT_FRAGMENT}
      }`,
  });
}

function dustMaterial(shared: Uniforms, pixelRatio: { value: number }) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { ...shared, uPixelRatio: pixelRatio },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime, uPixelRatio;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.11 + aSeed * 40.0) * 0.18;
        p.y = 0.15 + mod(p.y + uTime * (0.012 + 0.02 * aSeed), 2.7);
        p.z += cos(uTime * 0.07 + aSeed * 23.0) * 0.25;
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = uPixelRatio * (1.0 + 1.6 * aSeed) * 1.5 / max(0.8, -mvPosition.z);
        vAlpha = (0.12 + 0.3 * aSeed) * smoothstep(0.3, 1.4, -mvPosition.z) * exp(-0.11 * -mvPosition.z);
      }`,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        gl_FragColor = vec4(vec3(0.62, 0.9, 0.92) * (1.0 - smoothstep(0.1, 0.5, d)) * vAlpha, 1.0);
        ${OUTPUT_FRAGMENT}
      }`,
  });
}

const DOOR_TRAVEL = WORLD.aisle.doorHalf + 0.02;

export function buildAisle(context: WorldContext, pixelRatio: { value: number }): Part {
  const { model, scene, shared, fog, track } = context;
  const group = new Group();
  scene.add(group);
  const uniforms: Uniforms = {
    ...shared,
    uTelemetry: { value: 0 },
    uInvestigation: { value: 0 },
    uRecovery: { value: 0 },
    uFocus: { value: 0 },
  };

  // Everything in here is drawn upside-down under the translucent floor, which
  // reads as a reflection without a second render of the scene.
  const mirror = new Group();
  mirror.scale.y = -1;
  group.add(mirror);

  // ---- room: floor, architecture, light fixtures, doors
  const glows: { material: MeshBasicMaterial; base: Color }[] = [];
  const gains: Record<string, number> = { light_strip: 1.9, footlight: 1.15, door_light: 1.7 };
  const floor = addBaked(context, group, "Floor", 0.3);
  for (const mesh of childMeshes(floor)) {
    const material = mesh.material as MeshStandardMaterial;
    material.transparent = true;
    material.opacity = 0.84;
    material.roughness = 0.2;
    material.envMapIntensity = 2.4;
  }
  addBaked(context, group, "Room", 0.3);
  const roomGlow = takeNode(context, "RoomGlow");
  for (const mesh of childMeshes(roomGlow)) {
    const source = mesh.material as MeshStandardMaterial;
    const glow = glowMaterial(context, source.emissive, gains[source.name] ?? 2);
    glows.push(glow);
    mesh.material = glow.material;
    track(mesh.geometry);
  }
  roomGlow.removeFromParent();
  group.add(roomGlow);
  mirror.add(roomGlow.clone());

  const doors = (["DoorL", "DoorR"] as const).map((name, i) => {
    const node = takeNode(context, name);
    for (const mesh of childMeshes(node)) {
      const source = mesh.material as MeshStandardMaterial;
      track(mesh.geometry);
      if (source.name === "door_light") {
        const glow = glowMaterial(context, source.emissive, gains.door_light);
        glows.push(glow);
        mesh.material = glow.material;
      } else {
        source.metalness = Math.min(source.metalness, 0.3);
        track(source);
      }
    }
    node.removeFromParent();
    group.add(node);
    return { node, closedX: node.position.x, direction: i === 0 ? -1 : 1 };
  });

  // ---- cabinets: three Blender variants, instanced into the exported slots
  const slots: { slot: Slot; matrix: Matrix4 }[] = [];
  model.traverse((node) => {
    const slot = parseSlotName(node.name);
    if (slot) slots.push({ slot, matrix: node.matrixWorld.clone() });
  });
  if (slots.length === 0) throw new Error("world.glb has no cabinet slots");
  const isAlert = (slot: Slot) => slot.side === INVESTIGATED_SLOT.side && slot.index === INVESTIGATED_SLOT.index;

  const led = track(ledMaterial(uniforms, fog));
  for (const variant of ["A", "B", "C"] as const) {
    const placed = slots.filter(({ slot }) => slot.variant === variant);
    if (placed.length === 0) continue;
    const matrices = placed.map(({ matrix }) => matrix);
    for (const mesh of childMeshes(takeNode(context, `Rack${variant}`))) {
      const material = track(mesh.material as MeshStandardMaterial);
      material.metalness = Math.min(material.metalness, 0.45);
      group.add(instanced(context, mesh, material, matrices));
    }
    for (const mesh of childMeshes(takeNode(context, `RackLeds${variant}`))) {
      setLedAttributes(
        mesh,
        placed.map(({ slot }) => seeded(slot.index * 2 + (slot.side === "L" ? 0 : 1))),
        placed.map(({ slot }) => (isAlert(slot) ? 1 : 0)),
      );
      for (const parent of [group, mirror]) {
        const instances = instanced(context, mesh, led, matrices);
        instances.frustumCulled = false;
        parent.add(instances);
      }
    }
  }

  // ---- the investigated cabinet: outline panel + a light that spills on the aisle
  const alertLight = new PointLight(0xff8a2a, 0, 6, 1.8);
  const alertColor = { amber: new Color(0xff8a2a), green: new Color(0x8cff7a) };
  const alertSlot = slots.find(({ slot }) => isAlert(slot));
  if (alertSlot) {
    const panel = new Mesh(track(new PlaneGeometry(0.6, AISLE.rackHeight)), track(alertPanelMaterial(uniforms, 0.6, AISLE.rackHeight)));
    // Cabinet-local space after export: front faces +Z, origin at the front foot.
    panel.position.set(0, AISLE.rackHeight / 2, 0.03);
    const holder = new Group();
    holder.applyMatrix4(alertSlot.matrix);
    holder.add(panel);
    group.add(holder);
    alertLight.position.set(0, 1.25, 0.55).applyMatrix4(alertSlot.matrix);
    group.add(alertLight);
  }

  // ---- signal routes: from cabinets, up to the ceiling and down the aisle
  const nodeGeometry = track(new SphereGeometry(0.011, 10, 6));
  const nodeMaterial = track(new MeshBasicMaterial({ color: new Color(0.35, 1.25, 1.1) }));
  slots
    .filter(({ slot }) => slot.index >= 4 && slot.index % 2 === 0)
    .forEach(({ slot, matrix }, i) => {
      const side = slot.side === "L" ? -1 : 1;
      const start = new Vector3(0, 1.1 + 0.55 * seeded(i + 40), 0.035).applyMatrix4(matrix);
      const lane = side * (0.12 + 0.07 * (i % 5));
      const height = 2.42 + 0.05 * (i % 3);
      const curve = new CatmullRomCurve3(
        [
          start,
          new Vector3(start.x - side * 0.05, start.y + 0.35, start.z),
          new Vector3(start.x - side * 0.1, AISLE.rackHeight + 0.02, start.z - 0.05),
          new Vector3(lane + side * 0.35, height - 0.05, start.z - 0.45),
          new Vector3(lane, height, start.z - 1.1),
          new Vector3(lane * 0.8, height, (start.z + AISLE.endWallZ) / 2),
          new Vector3(lane * 0.35, 2.5, AISLE.endWallZ + 0.9),
          new Vector3(lane * 0.2, 2.42, AISLE.endWallZ + 0.24),
        ],
        false,
        "catmullrom",
        0.35,
      );
      const tube = new Mesh(track(new TubeGeometry(curve, 96, 0.0032, 5, false)), track(signalMaterial(uniforms, fog, seeded(i + 9))));
      tube.frustumCulled = false;
      group.add(tube);
      const node = new Mesh(nodeGeometry, nodeMaterial);
      node.position.copy(start);
      group.add(node);
    });

  // ---- dust in the light
  const dustCount = 260;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustSeeds = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i += 1) {
    dustPositions[i * 3] = (seeded(i * 3 + 1) - 0.5) * 2 * (AISLE.halfWidth - 0.1);
    dustPositions[i * 3 + 1] = seeded(i * 3 + 2) * 2.7;
    dustPositions[i * 3 + 2] = 2 - seeded(i * 3 + 3) * 11;
    dustSeeds[i] = seeded(i + 700);
  }
  const dustGeometry = track(new BufferGeometry());
  dustGeometry.setAttribute("position", new Float32BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute("aSeed", new Float32BufferAttribute(dustSeeds, 1));
  const dust = new Points(dustGeometry, track(dustMaterial(shared, pixelRatio)));
  dust.frustumCulled = false;
  group.add(dust);

  return {
    update({ time, pose, boot }: Frame) {
      group.visible = pose.u < 3.6;
      if (!group.visible) return;
      uniforms.uTelemetry.value = pose.telemetry * Math.min(1, boot * 1.4);
      uniforms.uInvestigation.value = pose.investigation;
      uniforms.uRecovery.value = pose.recovery;
      // Fixtures strike like fluorescent tubes during the power-on sweep.
      const strike = boot >= 1 ? 1 : Math.min(1, boot * 1.6) * (0.55 + 0.45 * Math.sign(Math.sin(time * 47) + 0.6));
      for (const { material, base } of glows) material.color.copy(base).multiplyScalar(strike);
      alertLight.color.copy(alertColor.amber).lerp(alertColor.green, Math.min(1, pose.recovery * 1.4));
      alertLight.intensity = 5 * pose.investigation + 2.2 * pose.recovery;
      for (const door of doors) door.node.position.x = door.closedX + door.direction * DOOR_TRAVEL * pose.doors;
    },
  };
}
