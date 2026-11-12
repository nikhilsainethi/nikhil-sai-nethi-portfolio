import {
  ACESFilmicToneMapping,
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  DynamicDrawUsage,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OrthographicCamera,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { AISLE } from "@/lib/datacentre-scene";
import {
  STORY_VIEWBOX,
  rackGroupPoint,
  storyFrame,
  storyViewport,
} from "@/lib/observability-story";
import {
  OUTPUT_FRAGMENT,
  alertPanelMaterial,
  childMeshes,
  fogUniforms,
  ledMaterial,
  loadDatacentreModel,
  seeded,
  type Uniforms,
} from "./shared";

/**
 * 3D diorama for the "Follow the signals" story.
 *
 * It is drawn with an orthographic camera into a transparent canvas that sits
 * exactly under the story's SVG overlay, and it is registered to that drawing:
 * one SVG unit is always the same distance on screen in both layers. The SVG
 * keeps everything that is text (signal cards, the trace panel, labels); this
 * scene replaces the flat racks with the Blender cabinets and adds the signal
 * beams and the request flow.
 */

export type StoryScene = {
  setProgress(value: number): void;
  setPointer(x: number, y: number): void;
  setAnimated(animated: boolean): void;
  setVisible(visible: boolean): void;
  /** Re-read the page's theme colours (call after a light/dark switch). */
  setTheme(): void;
  resize(): void;
  dispose(): void;
};

type Options = {
  canvas: HTMLCanvasElement;
  modelUrl: string;
  animated: boolean;
  progress: number;
  onContextLost: () => void;
};

/** SVG units per metre: a 2.2 m cabinet is about as tall as the drawn racks were. */
const UNITS_PER_METRE = 103;
const AZIMUTH = (16 * Math.PI) / 180;
const ELEVATION = (18 * Math.PI) / 180;
const PAIR_WIDTH = 1.2;
const VIEW_CENTRE = { x: STORY_VIEWBOX.width / 2, y: STORY_VIEWBOX.height / 2 };

/**
 * Where each cabinet pair stands in the drawing (front, bottom, centre) and
 * where its signal beam meets the card above it. Matches ObservabilityStory.
 */
const PAIRS = [
  { name: "compute", foot: { x: 202, y: 414 }, card: { x: 202, y: 115 }, variants: ["A", "A"] },
  { name: "model service", foot: { x: 392, y: 381 }, card: { x: 393, y: 115 }, variants: ["B", "A"] },
  { name: "storage", foot: { x: 582, y: 433 }, card: { x: 593, y: 115 }, variants: ["C", "C"] },
] as const;
const FOCUS_PAIR = 1;
const BEAM_ELBOW_Y = 150;
const PACKETS = 9;
const AMBIENT = 3.2;

function beamMaterial(shared: Uniforms, color: { value: Color }, offset: number) {
  return new ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: DoubleSide,
    uniforms: { ...shared, uColor: color, uOffset: { value: offset } },
    vertexShader: /* glsl */ `
      attribute float aAlong;
      varying float vAlong;
      void main() {
        vAlong = aAlong;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uSignals, uOffset;
      uniform vec3 uColor;
      varying float vAlong;
      void main() {
        float drawn = 1.0 - smoothstep(uSignals - 0.02, uSignals + 0.001, vAlong);
        float travel = fract(vAlong * 1.6 - uTime * 0.35 + uOffset);
        float pulse = smoothstep(0.82, 1.0, travel);
        gl_FragColor = vec4(uColor * (1.0 + 0.9 * pulse), drawn * (0.55 + 0.45 * pulse));
        ${OUTPUT_FRAGMENT}
      }`,
  });
}

export async function createStoryScene({
  canvas,
  modelUrl,
  animated: initiallyAnimated,
  progress: initialProgress,
  onContextLost,
}: Options): Promise<StoryScene> {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);

  let model;
  try {
    model = await loadDatacentreModel(modelUrl);
  } catch (error) {
    renderer.dispose();
    throw error;
  }

  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(item: T) => {
    disposables.push(item);
    return item;
  };

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const environment = track(pmrem.fromScene(new RoomEnvironment(), 0.04));
  pmrem.dispose();
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.35;
  const ambient = new AmbientLight(0xcfeaf2, AMBIENT);
  const key = new DirectionalLight(0xe8f6ff, 4.2);
  key.position.set(3.5, 6, 5);
  scene.add(ambient, key);

  const shared = {
    uTime: { value: 0 },
    uBoot: { value: 1 },
    uSignals: { value: 0 },
    uInvestigation: { value: 0 },
    uRecovery: { value: 0 },
    uFocus: { value: 0 },
  };
  const theme = {
    cyan: { value: new Color(0x70c9c6) },
    accent: new Color(0xd7f99a),
    danger: new Color(0xff9a8a),
    border: new Color(0x2a373c),
  };

  // ---- camera basis. `toCamera` points from the scene to the viewer.
  const toCamera = new Vector3();
  const right = new Vector3();
  const up = new Vector3();
  function setBasis(azimuth: number, elevation: number) {
    toCamera.set(Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation));
    right.set(Math.cos(azimuth), 0, -Math.sin(azimuth));
    up.crossVectors(toCamera, right);
  }
  setBasis(AZIMUTH, ELEVATION);

  // ---- stand each pair on the floor so it lines up with the SVG drawing.
  // Solve  foot = base + K * (P.right, -P.up)  for a floor point P = (x, 0, z).
  const base = PAIRS[FOCUS_PAIR].foot;
  const pairPositions = PAIRS.map(({ foot }) => {
    const a = (foot.x - base.x) / UNITS_PER_METRE;
    const b = -(foot.y - base.y) / UNITS_PER_METRE;
    const determinant = right.x * up.z - right.z * up.x;
    return new Vector3((a * up.z - right.z * b) / determinant, 0, (right.x * b - a * up.x) / determinant);
  });

  // ---- cabinets
  const matrix = new Matrix4();
  const placement = new Matrix4();
  const liftBake = (shader: { vertexShader: string }) => {
    // The lighting was baked for a cabinet standing in a row, where its sides
    // are hidden. Lift it so a free-standing cabinet still reads as a solid.
    shader.vertexShader = shader.vertexShader.replace(
      "#include <color_vertex>",
      "#include <color_vertex>\n  vColor.rgb = vColor.rgb * 0.6 + 0.46;",
    );
  };
  const led = track(ledMaterial(shared, fogUniforms(0x000000, 0)));
  for (const variant of ["A", "B", "C"] as const) {
    const placed: { position: Vector3; alert: number; seed: number }[] = [];
    PAIRS.forEach((pair, pairIndex) => {
      pair.variants.forEach((name, side) => {
        if (name !== variant) return;
        const position = pairPositions[pairIndex].clone();
        position.x += (side - 0.5) * (PAIR_WIDTH / 2);
        placed.push({ position, alert: pairIndex === FOCUS_PAIR ? 1 : 0, seed: seeded(pairIndex * 2 + side + 3) });
      });
    });
    const rack = model.getObjectByName(`Rack${variant}`);
    const leds = model.getObjectByName(`RackLeds${variant}`);
    if (!rack || !leds) throw new Error(`datacentre.glb is missing cabinet ${variant}`);
    for (const mesh of childMeshes(rack)) {
      const material = track((mesh.material as MeshStandardMaterial).clone());
      material.metalness = Math.min(material.metalness, 0.45);
      material.onBeforeCompile = liftBake;
      const instances = new InstancedMesh(track(mesh.geometry), material, placed.length);
      placed.forEach(({ position }, i) => {
        placement.makeTranslation(position.x, position.y, position.z);
        instances.setMatrixAt(i, matrix.multiplyMatrices(placement, mesh.matrixWorld));
      });
      instances.frustumCulled = false;
      scene.add(instances);
    }
    for (const mesh of childMeshes(leds)) {
      const geometry = track(mesh.geometry);
      geometry.setAttribute("aSeed", new InstancedBufferAttribute(new Float32Array(placed.map((p) => p.seed)), 1));
      geometry.setAttribute("aAlert", new InstancedBufferAttribute(new Float32Array(placed.map((p) => p.alert)), 1));
      const instances = new InstancedMesh(geometry, led, placed.length);
      placed.forEach(({ position }, i) => {
        placement.makeTranslation(position.x, position.y, position.z);
        instances.setMatrixAt(i, matrix.multiplyMatrices(placement, mesh.matrixWorld));
      });
      instances.frustumCulled = false;
      scene.add(instances);
    }
  }

  // ---- floor slab with a grid, and a strip of light at the foot of each pair
  const minX = Math.min(...pairPositions.map((p) => p.x)) - 1.3;
  const maxX = Math.max(...pairPositions.map((p) => p.x)) + 1.3;
  const minZ = Math.min(...pairPositions.map((p) => p.z)) - 1.5;
  const maxZ = Math.max(...pairPositions.map((p) => p.z)) + 1.2;
  const slab = new Mesh(
    track(new BoxGeometry(maxX - minX, 0.07, maxZ - minZ)),
    track(new MeshStandardMaterial({ color: 0x121d21, roughness: 0.42, metalness: 0.1 })),
  );
  slab.position.set((minX + maxX) / 2, -0.035, (minZ + maxZ) / 2);
  scene.add(slab);

  const gridPoints: number[] = [];
  for (let x = Math.ceil(minX / 0.6) * 0.6; x < maxX; x += 0.6) gridPoints.push(x, 0.002, minZ, x, 0.002, maxZ);
  for (let z = Math.ceil(minZ / 0.6) * 0.6; z < maxZ; z += 0.6) gridPoints.push(minX, 0.002, z, maxX, 0.002, z);
  const gridGeometry = track(new BufferGeometry());
  gridGeometry.setAttribute("position", new Float32BufferAttribute(gridPoints, 3));
  const gridMaterial = track(new LineBasicMaterial({ color: 0x70c9c6, transparent: true, opacity: 0.22 }));
  scene.add(new LineSegments(gridGeometry, gridMaterial));
  const rim = new Float32BufferAttribute(
    [minX, 0.003, minZ, maxX, 0.003, minZ, maxX, 0.003, minZ, maxX, 0.003, maxZ,
      maxX, 0.003, maxZ, minX, 0.003, maxZ, minX, 0.003, maxZ, minX, 0.003, minZ], 3);
  const rimGeometry = track(new BufferGeometry());
  rimGeometry.setAttribute("position", rim);
  const rimMaterial = track(new LineBasicMaterial({ color: 0x70c9c6, transparent: true, opacity: 0.55 }));
  scene.add(new LineSegments(rimGeometry, rimMaterial));

  const footlightGeometry = track(new PlaneGeometry(PAIR_WIDTH, 0.03));
  const footlightMaterial = track(new MeshBasicMaterial({ color: 0x70c9c6, side: DoubleSide }));
  for (const position of pairPositions) {
    const strip = new Mesh(footlightGeometry, footlightMaterial);
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(position.x, 0.004, position.z + 0.03);
    scene.add(strip);
  }

  // ---- the pair under investigation
  const focus = pairPositions[FOCUS_PAIR];
  const panel = new Mesh(
    track(new PlaneGeometry(PAIR_WIDTH, AISLE.rackHeight)),
    track(alertPanelMaterial(shared, PAIR_WIDTH, AISLE.rackHeight)),
  );
  panel.position.set(focus.x, AISLE.rackHeight / 2, focus.z + 0.03);
  scene.add(panel);
  const alertLight = new PointLight(0xff8a2a, 0, 5, 1.8);
  alertLight.position.set(focus.x, 1.2, focus.z + 0.7);
  scene.add(alertLight);
  const alertColor = { amber: new Color(0xff8a2a), green: new Color(0x8cff7a) };

  // ---- request flow: packets travel compute -> model service -> storage
  const lane = pairPositions.map((p) => new Vector3(p.x, 0.045, p.z + 0.5));
  const route = [lane[0].clone().add(new Vector3(-0.9, 0, 0.25)), ...lane, lane[2].clone().add(new Vector3(0.9, 0, 0.25))];
  const routeLengths = route.slice(1).map((point, i) => point.distanceTo(route[i]));
  const routeLength = routeLengths.reduce((sum, length) => sum + length, 0);
  const slowFrom = (routeLengths[0] + routeLengths[1]) / routeLength;   // leaving the model service
  const slowTo = slowFrom + routeLengths[2] / routeLength;              // arriving at storage
  const routePoint = (t: number, target: Vector3) => {
    let distance = Math.min(0.9999, Math.max(0, t)) * routeLength;
    for (let i = 0; i < routeLengths.length; i += 1) {
      if (distance <= routeLengths[i]) return target.lerpVectors(route[i], route[i + 1], distance / routeLengths[i]);
      distance -= routeLengths[i];
    }
    return target.copy(route[route.length - 1]);
  };
  const routeGeometry = track(new BufferGeometry());
  routeGeometry.setAttribute(
    "position",
    new Float32BufferAttribute(route.slice(1).flatMap((point, i) => [...route[i].toArray(), ...point.toArray()]).map((v, i) => (i % 3 === 1 ? 0.006 : v)), 3),
  );
  const routeMaterial = track(new LineBasicMaterial({ color: 0x70c9c6, transparent: true, opacity: 0.5 }));
  scene.add(new LineSegments(routeGeometry, routeMaterial));
  const packets = new InstancedMesh(track(new SphereGeometry(0.04, 14, 10)), track(new MeshBasicMaterial({ color: 0xffffff })), PACKETS);
  packets.instanceMatrix.setUsage(DynamicDrawUsage);
  packets.frustumCulled = false;
  scene.add(packets);
  const packetPhase = Array.from({ length: PACKETS }, (_, i) => i / PACKETS);
  const packetColor = new Color();
  const packetPosition = new Vector3();

  // ---- signal beams, rebuilt every frame in the plane of the screen
  const beams = PAIRS.map((_, i) => {
    const geometry = track(new BufferGeometry());
    const positions = new Float32BufferAttribute(new Float32Array(12 * 3), 3);
    positions.setUsage(DynamicDrawUsage);
    geometry.setAttribute("position", positions);
    geometry.setAttribute("aAlong", new Float32BufferAttribute(new Float32Array(12), 1));
    geometry.setIndex([0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7, 8, 9, 10, 10, 9, 11]);
    const mesh = new Mesh(geometry, track(beamMaterial(shared, theme.cyan, seeded(i + 21))));
    mesh.frustumCulled = false;
    mesh.renderOrder = 10;
    scene.add(mesh);
    return geometry;
  });

  // ---- camera, registered to the SVG
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 120);
  const target = new Vector3();
  const anchor = new Vector3();
  let zoom = 1;
  const svgToWorld = (x: number, y: number, out: Vector3) =>
    out
      .copy(target)
      .addScaledVector(right, (x - VIEW_CENTRE.x) / (UNITS_PER_METRE * zoom))
      .addScaledVector(up, -(y - VIEW_CENTRE.y) / (UNITS_PER_METRE * zoom));
  const worldToSvg = (point: Vector3) => {
    anchor.copy(point).sub(target);
    return {
      x: VIEW_CENTRE.x + zoom * UNITS_PER_METRE * anchor.dot(right),
      y: VIEW_CENTRE.y - zoom * UNITS_PER_METRE * anchor.dot(up),
    };
  };

  let width = 0;
  let height = 0;
  function resize() {
    const parent = canvas.parentElement;
    width = Math.max(1, Math.round(parent?.clientWidth ?? canvas.clientWidth));
    height = Math.max(1, Math.round(parent?.clientHeight ?? canvas.clientHeight));
    const { unitsWide, unitsHigh } = storyViewport(width, height);
    camera.left = -unitsWide / 2 / UNITS_PER_METRE;
    camera.right = unitsWide / 2 / UNITS_PER_METRE;
    camera.top = unitsHigh / 2 / UNITS_PER_METRE;
    camera.bottom = -unitsHigh / 2 / UNITS_PER_METRE;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    requestFrame();
  }

  function setTheme() {
    const style = getComputedStyle(canvas);
    const read = (name: string, into: Color) => {
      const value = style.getPropertyValue(name).trim();
      if (value) into.setStyle(value);
    };
    read("--infra-cyan", theme.cyan.value);
    read("--infra-accent", theme.accent);
    read("--infra-danger", theme.danger);
    read("--infra-border", theme.border);
    gridMaterial.color.copy(theme.cyan.value);
    rimMaterial.color.copy(theme.cyan.value);
    routeMaterial.color.copy(theme.cyan.value);
    footlightMaterial.color.copy(theme.cyan.value);
    requestFrame();
  }

  // ---- state + loop
  let animated = initiallyAnimated;
  let visible = true;
  let disposed = false;
  let ready = false;
  let frameId = 0;
  let last = 0;
  let clock = 0;
  let targetProgress = initialProgress;
  let progress = initialProgress;
  const pointerTarget = { x: 0, y: 0 };
  const pointer = { x: 0, y: 0 };
  const start = new Vector3();
  const corner = new Vector3();

  function writeBeam(geometry: BufferGeometry, points: { x: number; y: number }[], halfWidth: number) {
    const positions = geometry.getAttribute("position") as Float32BufferAttribute;
    const along = geometry.getAttribute("aAlong") as Float32BufferAttribute;
    const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
    const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
    let travelled = 0;
    for (let segment = 0; segment < 3; segment += 1) {
      const a = points[segment];
      const b = points[segment + 1];
      const length = lengths[segment] || 1;
      const dx = (b.x - a.x) / length;
      const dy = (b.y - a.y) / length;
      // extend each segment by the half width so the corners close
      const ends = [
        { x: a.x - dx * halfWidth, y: a.y - dy * halfWidth, t: travelled / total },
        { x: b.x + dx * halfWidth, y: b.y + dy * halfWidth, t: (travelled + lengths[segment]) / total },
      ];
      ends.forEach((end, e) => {
        for (const side of [-1, 1]) {
          const index = segment * 4 + e * 2 + (side + 1) / 2;
          svgToWorld(end.x - dy * halfWidth * side, end.y + dx * halfWidth * side, corner);
          positions.setXYZ(index, corner.x, corner.y, corner.z);
          along.setX(index, end.t);
        }
      });
      travelled += lengths[segment];
    }
    positions.needsUpdate = true;
    along.needsUpdate = true;
  }

  function draw(now: number) {
    frameId = 0;
    if (disposed || !visible) return;
    const delta = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    if (animated) {
      clock += delta;
      const ease = 1 - Math.exp(-delta * 6);
      progress += (targetProgress - progress) * ease;
      pointer.x += (pointerTarget.x - pointer.x) * ease;
      pointer.y += (pointerTarget.y - pointer.y) * ease;
    } else {
      progress = targetProgress;
      pointer.x = pointer.y = 0;
    }
    const frame = storyFrame(progress);

    // Camera: a slow sway plus the pointer, then pan/zoom to follow the SVG rack group.
    const sway = animated ? Math.sin(clock * 0.25) * 0.035 : 0;
    setBasis(AZIMUTH + sway + pointer.x * 0.09, ELEVATION - pointer.y * 0.05);
    zoom = frame.rackScale;
    const origin = rackGroupPoint(frame, base.x, base.y);
    target
      .set(0, 0, 0)
      .addScaledVector(right, -(origin.x - VIEW_CENTRE.x) / (UNITS_PER_METRE * zoom))
      .addScaledVector(up, (origin.y - VIEW_CENTRE.y) / (UNITS_PER_METRE * zoom));
    camera.position.copy(target).addScaledVector(toCamera, 40);
    camera.up.set(0, 1, 0);
    camera.lookAt(target);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();

    shared.uTime.value = clock;
    shared.uSignals.value = frame.signals;
    shared.uInvestigation.value = frame.investigation;
    shared.uRecovery.value = frame.recovery;
    shared.uFocus.value = frame.trace * 0.8;
    ambient.intensity = AMBIENT * (1 - 0.3 * frame.trace);
    alertLight.color.copy(alertColor.amber).lerp(alertColor.green, Math.min(1, frame.recovery * 1.4));
    alertLight.intensity = 4 * frame.investigation + 2 * frame.recovery;

    // Beams: up from each pair, across at the elbow, into the card above it.
    PAIRS.forEach((pair, i) => {
      start.copy(pairPositions[i]).setY(AISLE.rackHeight);
      const from = worldToSvg(start);
      const elbow = Math.min(BEAM_ELBOW_Y, from.y - 6);
      writeBeam(beams[i], [from, { x: from.x, y: elbow }, { x: pair.card.x, y: elbow }, pair.card], 0.85);
    });

    // Packets slow down between the model service and storage while the lookup is slow.
    for (let i = 0; i < PACKETS; i += 1) {
      const inSlowLeg = packetPhase[i] > slowFrom && packetPhase[i] < slowTo;
      const speed = 0.11 * (inSlowLeg ? 1 - 0.82 * frame.investigation : 1) * (1 + 0.5 * frame.recovery);
      if (animated) packetPhase[i] = (packetPhase[i] + delta * speed) % 1;
      routePoint(packetPhase[i], packetPosition);
      const fade = Math.min(1, packetPhase[i] / 0.06, (1 - packetPhase[i]) / 0.06);
      placement.makeScale(fade, fade, fade).setPosition(packetPosition);
      packets.setMatrixAt(i, placement);
      packetColor.copy(theme.cyan.value);
      if (inSlowLeg) packetColor.lerp(theme.danger, frame.investigation);
      packetColor.lerp(theme.accent, frame.recovery).multiplyScalar(1.5);
      packets.setColorAt(i, packetColor);
    }
    packets.instanceMatrix.needsUpdate = true;
    if (packets.instanceColor) packets.instanceColor.needsUpdate = true;

    renderer.render(scene, camera);
    if (animated) frameId = requestAnimationFrame(draw);
  }

  function requestFrame() {
    if (ready && !frameId && !disposed && visible) frameId = requestAnimationFrame(draw);
  }

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    onContextLost();
  };
  canvas.addEventListener("webglcontextlost", handleContextLost);

  resize();
  setTheme();
  // First pass places everything (beams, packets) before shaders are compiled.
  ready = true;
  draw(performance.now());
  last = 0;

  return {
    setProgress(value) {
      targetProgress = value;
      requestFrame();
    },
    setPointer(x, y) {
      pointerTarget.x = x;
      pointerTarget.y = y;
      requestFrame();
    },
    setAnimated(next) {
      animated = next;
      last = 0;
      requestFrame();
    },
    setVisible(next) {
      visible = next;
      last = 0;
      if (visible) requestFrame();
      else if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    },
    setTheme,
    resize,
    dispose() {
      disposed = true;
      if (frameId) cancelAnimationFrame(frameId);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      for (const item of disposables) item.dispose();
      scene.traverse((node) => {
        const mesh = node as Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of materials as Material[]) material?.dispose();
      });
      renderer.dispose();
    },
  };
}
