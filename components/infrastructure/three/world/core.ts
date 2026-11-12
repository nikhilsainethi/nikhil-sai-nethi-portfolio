import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from "three";
import {
  CORE_CENTRE_Z,
  FIRST_TIER,
  LAST_TIER,
  PLATFORMS,
  SECTOR_ANGLE,
  TIER_HEIGHT,
  WORLD,
  sectorHasRacks,
  sectorIsOpen,
} from "@/lib/world-layout";
import { stopIndex } from "@/lib/world-path";
import { FOG_FRAGMENT, FOG_VERTEX, OUTPUT_FRAGMENT, childMeshes, ledMaterial, seeded, type Uniforms } from "../shared";
import { addBaked, glowMaterial, instanced, setLedAttributes, takeNode, type Frame, type Part, type WorldContext } from "./context";

/**
 * The core: a silo of cabinets around a glowing spine, with one exhibit
 * platform per case study. Decks, railings, lights and cabinets are a single
 * 22.5 degree sector from Blender, instanced around the axis and up the tiers.
 */

const CENTRE = new Vector3(0, 0, CORE_CENTRE_Z);
const ALERT_RED = new Color(1.0, 0.3, 0.2);
const RESTORE_GREEN = new Color(0.5, 1.0, 0.55);
// Once the camera is out on the roof only the top of the spine can be seen through the oculus.
const DENSE_UNTIL = stopIndex("above-oculus") + 0.7;

function sectorMatrix(tier: number, sector: number) {
  return new Matrix4()
    .makeTranslation(CENTRE.x, tier * TIER_HEIGHT, CENTRE.z)
    .multiply(new Matrix4().makeRotationY(sector * SECTOR_ANGLE))
    .multiply(new Matrix4().makeTranslation(-CENTRE.x, 0, -CENTRE.z));
}

function flowMaterial(uniforms: Uniforms, fog: Uniforms) {
  return new ShaderMaterial({
    side: DoubleSide,
    uniforms: { ...uniforms, ...fog },
    vertexShader: /* glsl */ `
      attribute vec3 color;
      varying vec2 vUv;
      varying float vLane;
      varying float vFogDepth;
      void main() {
        vUv = uv;
        vLane = color.r;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        ${FOG_VERTEX}
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uAlert, uRestore, uFogDensity;
      uniform vec3 uFogColor;
      varying vec2 vUv;
      varying float vLane;
      varying float vFogDepth;
      void main() {
        // Dashes of light climbing the spine: the signal on its way up.
        float speed = mix(0.5, 1.6, uAlert);
        float flow = fract(vUv.y * 13.0 - uTime * speed + vLane * 3.7);
        float dash = smoothstep(0.0, 0.08, flow) * (1.0 - smoothstep(0.5, 0.95, flow));
        vec3 warm = vec3(1.0, 0.74, 0.4);
        vec3 tint = mix(warm, vec3(1.0, 0.3, 0.2), uAlert);
        tint = mix(tint, vec3(0.5, 1.0, 0.55), uRestore);
        gl_FragColor = vec4(tint * (0.35 + 1.25 * dash), 1.0);
        ${FOG_FRAGMENT}
        ${OUTPUT_FRAGMENT}
      }`,
  });
}

function poolMaterial(uniforms: Uniforms, fog: Uniforms) {
  return new ShaderMaterial({
    side: DoubleSide,
    uniforms: { ...uniforms, ...fog },
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
      uniform float uTime, uAlert, uFogDensity;
      uniform vec3 uFogColor;
      varying vec2 vUv;
      varying float vFogDepth;
      void main() {
        float ring = 0.5 + 0.5 * sin(vUv.x * 46.0 - uTime * 0.9);
        vec3 tint = mix(vec3(0.07, 0.5, 0.6), vec3(0.7, 0.16, 0.1), uAlert);
        gl_FragColor = vec4(tint * (0.35 + 0.9 * ring * ring) * (1.25 - vUv.x), 1.0);
        ${FOG_FRAGMENT}
        ${OUTPUT_FRAGMENT}
      }`,
  });
}

function screenMaterial(uniforms: Uniforms, fog: Uniforms) {
  return new ShaderMaterial({
    side: DoubleSide,
    uniforms: { ...uniforms, ...fog },
    vertexShader: /* glsl */ `
      attribute vec3 color;
      varying vec2 vUv;
      varying float vSeed;
      varying float vFogDepth;
      void main() {
        vUv = uv;
        vSeed = color.r;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        ${FOG_VERTEX}
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uAlert, uFogDensity;
      uniform vec3 uFogColor;
      varying vec2 vUv;
      varying float vSeed;
      varying float vFogDepth;
      float hash(float n) { return fract(sin(n) * 43758.5453); }
      float noise(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(hash(i), hash(i + 1.0), f); }
      void main() {
        vec2 uv = vec2(vUv.x, 1.0 - vUv.y); // glTF stores V top-down
        float seed = vSeed * 7.0 + 1.0;
        vec3 accent = mix(vec3(0.3, 0.95, 0.85), vec3(0.84, 0.98, 0.6), step(0.5, fract(seed * 0.37)));
        vec3 alarm = vec3(1.0, 0.36, 0.26);
        vec3 lineColor = mix(accent, alarm, uAlert);
        vec3 color = vec3(0.01, 0.028, 0.032);
        vec2 cell = abs(fract(uv * vec2(6.0, 12.0)) - 0.5);
        color += accent * smoothstep(0.47, 0.5, max(cell.x, cell.y)) * 0.07;
        // a live line chart in the upper half
        float t = uTime * 0.3 + seed * 11.0;
        float value = 0.45 + 0.34 * (noise(uv.x * 5.0 + t) - 0.5) + 0.07 * sin(uv.x * 19.0 + t * 2.3);
        value += uAlert * 0.36 * smoothstep(0.5, 0.92, uv.x) * (0.75 + 0.25 * sin(uTime * 7.0));
        float y = mix(0.52, 0.88, clamp(value, 0.0, 1.0));
        float inChart = step(0.5, uv.y) * step(uv.y, 0.9);
        color += lineColor * (1.0 - smoothstep(0.0, 0.011, abs(uv.y - y))) * 1.8 * inChart;
        color += lineColor * step(uv.y, y) * inChart * 0.16 * (uv.y - 0.5) / 0.38;
        color += alarm * (1.0 - smoothstep(0.0, 0.004, abs(uv.y - 0.8))) * step(0.5, fract(uv.x * 30.0)) * 0.5;
        // request bars below it
        float column = floor(uv.x * 16.0);
        float height = 0.1 + 0.3 * hash(column + seed * 3.0 + floor(uTime * 0.7 + column * 0.17));
        float bar = step(fract(uv.x * 16.0), 0.68) * step(0.09, uv.y) * step(uv.y, height);
        color += mix(accent, alarm, uAlert * step(11.0, column)) * bar * 0.6;
        color += accent * step(0.945, uv.y) * 0.3;
        color *= 0.92 + 0.08 * sin(uv.y * 500.0);
        gl_FragColor = vec4(color * 1.25, 1.0);
        ${FOG_FRAGMENT}
        ${OUTPUT_FRAGMENT}
      }`,
  });
}

/** Evenly spread points on a sphere. */
function fibonacci(index: number, count: number, out: Vector3) {
  const y = 1 - (2 * (index + 0.5)) / count;
  const radius = Math.sqrt(1 - y * y);
  const theta = index * 2.399963;
  return out.set(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
}

export function buildCore(context: WorldContext): Part {
  const { scene, shared, fog, track } = context;
  const group = new Group();
  const dense = new Group(); // the instanced tiers: hidden once the camera is out on the roof
  scene.add(group);
  group.add(dense);
  const uniforms: Uniforms = { ...shared, uInvestigation: shared.uAlert, uRecovery: shared.uRestore, uFocus: { value: 0 } };

  for (const name of ["CoreShell", "CoreSpine", "CorePlatforms", "Exhibits"]) addBaked(context, group, name, 0.4);

  // ---- tiers: one sector instanced around the axis and up the silo
  const sectors: { tier: number; sector: number; matrix: Matrix4 }[] = [];
  for (let tier = FIRST_TIER; tier <= LAST_TIER; tier += 1)
    for (let sector = 0; sector < WORLD.core.sectors; sector += 1) sectors.push({ tier, sector, matrix: sectorMatrix(tier, sector) });
  const everywhere = sectors.map(({ matrix }) => matrix);
  const railed = sectors.filter(({ tier, sector }) => !sectorIsOpen(tier, sector)).map(({ matrix }) => matrix);
  const racked = sectors.filter(({ tier, sector }) => sectorHasRacks(tier, sector));

  for (const mesh of childMeshes(takeNode(context, "CoreDeckSector"))) {
    const material = track(mesh.material as MeshStandardMaterial);
    material.metalness = Math.min(material.metalness, 0.4);
    dense.add(instanced(context, mesh, material, everywhere));
  }
  for (const mesh of childMeshes(takeNode(context, "CoreRailSector"))) {
    const material = track(mesh.material as MeshStandardMaterial);
    material.metalness = Math.min(material.metalness, 0.4);
    dense.add(instanced(context, mesh, material, railed));
  }
  const ringLight = glowMaterial(context, new Color(0.74, 0.88, 1.0), 0.8);
  const edgeLight = glowMaterial(context, new Color(0.32, 1.0, 0.84), 1.0);
  for (const mesh of childMeshes(takeNode(context, "CoreGlowSector"))) {
    const isRing = (mesh.material as MeshStandardMaterial).name === "core_ring";
    dense.add(instanced(context, mesh, (isRing ? ringLight : edgeLight).material, everywhere));
  }
  for (const mesh of childMeshes(takeNode(context, "CoreRackSector"))) {
    const material = track(mesh.material as MeshStandardMaterial);
    material.color.setScalar(1 / 9); // undoes the factor the Blender bake folds into the vertex colours
    material.metalness = 0.3;
    material.roughness = 0.5;
    dense.add(instanced(context, mesh, material, racked.map(({ matrix }) => matrix)));
  }
  const led = track(ledMaterial(uniforms, fog, { sweep: false, gain: 3.0 }));
  for (const mesh of childMeshes(takeNode(context, "CoreLedSector"))) {
    setLedAttributes(
      mesh,
      racked.map(({ tier, sector }) => seeded(tier * 31 + sector * 7 + 5)),
      racked.map(({ tier, sector }) => (seeded(tier * 13 + sector * 3 + 90) > 0.45 ? 1 : 0)),
    );
    const instances = instanced(context, mesh, led, racked.map(({ matrix }) => matrix));
    instances.frustumCulled = false;
    dense.add(instances);
  }

  // ---- spine: climbing light, the pool below, the crown light above
  const flow = track(flowMaterial(shared, fog));
  const pool = track(poolMaterial(shared, fog));
  const spineGlow = takeNode(context, "CoreSpineGlow");
  for (const mesh of childMeshes(spineGlow)) {
    track(mesh.geometry);
    const name = (mesh.material as MeshStandardMaterial).name;
    mesh.material = name === "spine_flow" ? flow : name === "pit_pool" ? pool : name === "core_ring" ? ringLight.material : edgeLight.material;
  }
  spineGlow.removeFromParent();
  group.add(spineGlow);

  // ---- platforms and exhibits
  const platformGlow = takeNode(context, "CorePlatformGlow");
  for (const mesh of childMeshes(platformGlow)) {
    track(mesh.geometry);
    mesh.material = glowMaterial(context, (mesh.material as MeshStandardMaterial).emissive, 1.1).material;
  }
  platformGlow.removeFromParent();
  group.add(platformGlow);

  const screens = track(screenMaterial(shared, fog));
  const gate = glowMaterial(context, new Color(0.6, 1.0, 0.56), 1.0);
  const mastLight = glowMaterial(context, new Color(1.0, 0.16, 0.1), 2.4);
  const cloud = track(new MeshBasicMaterial({ color: new Color(0.3, 0.52, 0.8), transparent: true, opacity: 0.55, depthWrite: false }));
  const exhibitLed = track(ledMaterial(uniforms, fog, { sweep: false, gain: 3.0 }));
  const exhibitGlow = takeNode(context, "ExhibitGlow");
  for (const mesh of childMeshes(exhibitGlow)) {
    const name = (mesh.material as MeshStandardMaterial).name;
    track(mesh.geometry);
    if (name === "led") {
      // The LED shader is written for instances: draw this one mesh as a single instance.
      setLedAttributes(mesh, [0.37], [0]);
      const instances = new InstancedMesh(mesh.geometry, exhibitLed, 1);
      instances.setMatrixAt(0, mesh.matrixWorld);
      instances.frustumCulled = false;
      group.add(instances);
      mesh.visible = false;
    } else if (name === "screen") mesh.material = screens;
    else if (name === "gate") mesh.material = gate.material;
    else if (name === "mast_light") mesh.material = mastLight.material;
    else if (name === "cloud_block") mesh.material = cloud;
    else mesh.material = glowMaterial(context, (mesh.material as MeshStandardMaterial).emissive, 1.5).material;
  }
  exhibitGlow.removeFromParent();
  group.add(exhibitGlow);

  const marker = (name: string) => takeNode(context, name).getWorldPosition(new Vector3());

  // networking: broadcast rings spreading from the antennas
  const antenna = marker("MarkerAntenna");
  const ringGeometry = track(new RingGeometry(0.955, 1.0, 64));
  const waves = [0, 1, 2].map(() => {
    const material = track(new MeshBasicMaterial({ color: new Color(0.35, 1.2, 1.3), transparent: true, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }));
    const mesh = new Mesh(ringGeometry, material);
    mesh.position.copy(antenna);
    mesh.rotation.x = -Math.PI / 2;
    group.add(mesh);
    return { mesh, material };
  });

  // knowledge: documents orbiting an index, the retrieved ones lighting up
  const orb = marker("MarkerOrb");
  const lattice = new Group();
  lattice.position.copy(orb);
  group.add(lattice);
  const violet = new Color(PLATFORMS[2].accent[0], PLATFORMS[2].accent[1], PLATFORMS[2].accent[2]);
  lattice.add(new Mesh(track(new IcosahedronGeometry(0.4, 1)), track(new MeshBasicMaterial({ color: violet.clone().multiplyScalar(1.5), wireframe: true }))));
  lattice.add(new Mesh(track(new SphereGeometry(0.17, 16, 12)), track(new MeshBasicMaterial({ color: violet.clone().multiplyScalar(2.6) }))));
  const DOCS = 64;
  const RETRIEVED = 7;
  const docs = new InstancedMesh(track(new BoxGeometry(0.2, 0.27, 0.012)), track(new MeshBasicMaterial({ color: 0xffffff })), DOCS);
  const docPositions: Vector3[] = [];
  const dummy = new Object3D();
  for (let i = 0; i < DOCS; i += 1) {
    const position = fibonacci(i, DOCS, new Vector3()).multiplyScalar(0.95 + 0.85 * seeded(i + 300));
    position.y *= 0.8;
    docPositions.push(position);
    dummy.position.copy(position);
    dummy.lookAt(0, 0, 0);
    dummy.updateMatrix();
    docs.setMatrixAt(i, dummy.matrix);
  }
  docs.instanceMatrix.needsUpdate = true;
  docs.frustumCulled = false;
  lattice.add(docs);
  const linkGeometry = track(new BufferGeometry());
  const linkPositions = new Float32BufferAttribute(new Float32Array(RETRIEVED * 6), 3);
  linkPositions.setUsage(DynamicDrawUsage);
  linkGeometry.setAttribute("position", linkPositions);
  const linkMaterial = track(new LineBasicMaterial({ color: violet.clone().multiplyScalar(1.8), transparent: true }));
  const links = new LineSegments(linkGeometry, linkMaterial);
  links.frustumCulled = false;
  lattice.add(links);
  const dim = violet.clone().multiplyScalar(0.22);
  const lit = violet.clone().multiplyScalar(2.4);
  let query = -1;

  // migration: workloads leave the legacy machine, pass the test gate, land in the cloud
  const arcStart = marker("MarkerArcStart");
  const arcEnd = marker("MarkerArcEnd");
  const arcLift = marker("MarkerArcApex").y - (arcStart.y + arcEnd.y) / 2;
  const LOADS = 5;
  const loads = new InstancedMesh(track(new BoxGeometry(0.2, 0.2, 0.2)), track(new MeshBasicMaterial({ color: 0xffffff })), LOADS);
  loads.instanceMatrix.setUsage(DynamicDrawUsage);
  loads.frustumCulled = false;
  group.add(loads);
  const legacy = new Color(1.0, 0.62, 0.22).multiplyScalar(1.6);
  const migrated = new Color(0.45, 0.75, 1.0).multiplyScalar(1.8);
  const loadColor = new Color();
  const loadPosition = new Vector3();
  const loadMatrix = new Matrix4();

  return {
    update({ time, pose, alert, recovery }: Frame) {
      group.visible = pose.u > 1.4;
      if (!group.visible) return;
      dense.visible = pose.u < DENSE_UNTIL;

      ringLight.material.color.copy(ringLight.base).lerp(ALERT_RED, alert * 0.85).lerp(RESTORE_GREEN, recovery * 0.5);
      edgeLight.material.color.copy(edgeLight.base).lerp(ALERT_RED, alert * 0.9).lerp(RESTORE_GREEN, recovery * 0.6);
      mastLight.material.color.copy(mastLight.base).multiplyScalar(Math.sin(time * 2.4) > 0.2 ? 1 : 0.12);

      waves.forEach(({ mesh, material }, i) => {
        const phase = (time * 0.32 + i / 3) % 1;
        mesh.scale.setScalar(0.35 + 2.9 * phase);
        material.opacity = (1 - phase) * 0.75;
      });

      lattice.rotation.y = time * 0.13;
      const nextQuery = Math.floor(time / 1.9);
      if (nextQuery !== query) {
        query = nextQuery;
        const chosen = new Set<number>();
        for (let k = 0; chosen.size < RETRIEVED; k += 1) chosen.add(Math.floor(seeded(query * 17 + k * 5 + 1) * DOCS) % DOCS);
        let segment = 0;
        for (let i = 0; i < DOCS; i += 1) {
          docs.setColorAt(i, chosen.has(i) ? lit : dim);
          if (chosen.has(i)) {
            linkPositions.setXYZ(segment * 2, 0, 0, 0);
            linkPositions.setXYZ(segment * 2 + 1, docPositions[i].x, docPositions[i].y, docPositions[i].z);
            segment += 1;
          }
        }
        linkPositions.needsUpdate = true;
        if (docs.instanceColor) docs.instanceColor.needsUpdate = true;
      }
      linkMaterial.opacity = 0.25 + 0.75 * Math.min(1, ((time / 1.9) % 1) * 3);

      let flash = 0;
      for (let i = 0; i < LOADS; i += 1) {
        const t = (time * 0.11 + i / LOADS) % 1;
        loadPosition.lerpVectors(arcStart, arcEnd, t);
        loadPosition.y += arcLift * 4 * t * (1 - t) + 0.14;
        const scale = Math.min(1, t / 0.06, (1 - t) / 0.06);
        loadMatrix.makeScale(scale, scale, scale).setPosition(loadPosition);
        loads.setMatrixAt(i, loadMatrix);
        loads.setColorAt(i, loadColor.copy(legacy).lerp(migrated, t < 0.5 ? 0 : 1));
        flash = Math.max(flash, 1 - Math.abs(t - 0.5) / 0.06);
      }
      loads.instanceMatrix.needsUpdate = true;
      if (loads.instanceColor) loads.instanceColor.needsUpdate = true;
      gate.material.color.copy(gate.base).multiplyScalar(0.7 + 2.6 * Math.max(0, flash));
    },
  };
}
