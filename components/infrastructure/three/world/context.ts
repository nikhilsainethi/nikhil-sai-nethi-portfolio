import {
  Color,
  DoubleSide,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Scene,
} from "three";
import type { WorldPose } from "@/lib/world-path";
import { childMeshes, type Uniforms } from "../shared";

/** What every part of the world gets each frame. */
export type Frame = {
  time: number;
  delta: number;
  pose: WorldPose;
  /** 0..1 power-on sequence in the hero aisle. */
  boot: number;
  /** 0..1 the signal lab has injected a fault. */
  alert: number;
  /** 0..1 fades out after the lab recovers. */
  recovery: number;
  animated: boolean;
};

export type Part = { update(frame: Frame): void };

export type WorldContext = {
  model: Group;
  scene: Scene;
  /** uTime, uBoot, uAlert, uRecovery: one object shared by every shader. */
  shared: Uniforms;
  fog: Uniforms;
  track<T extends { dispose(): void }>(item: T): T;
};

const scratch = new Matrix4();

/** Find a named object exported from Blender (the glTF loader strips dots from names). */
export function takeNode(context: WorldContext, name: string) {
  const node = context.model.getObjectByName(name);
  if (!node) throw new Error(`world.glb is missing "${name}"`);
  return node;
}

/** Move a baked object into the scene with its standard materials tamed for the baked look. */
export function addBaked(context: WorldContext, parent: Object3D, name: string, metalness = 0.35) {
  const node = takeNode(context, name);
  for (const mesh of childMeshes(node)) {
    const material = context.track(mesh.material as MeshStandardMaterial);
    material.metalness = Math.min(material.metalness, metalness);
    context.track(mesh.geometry);
  }
  node.removeFromParent();
  parent.add(node);
  return node;
}

/** A flat, unlit, HDR-bright material: what a light fixture looks like to the bloom pass. */
export function glowMaterial(context: WorldContext, color: Color, gain: number) {
  const material = context.track(new MeshBasicMaterial({ color: color.clone().multiplyScalar(gain), side: DoubleSide }));
  return { material, base: color.clone().multiplyScalar(gain) };
}

/** Instance one exported mesh at many transforms (applied on top of the mesh's own placement). */
export function instanced(context: WorldContext, mesh: Mesh, material: Material, matrices: Matrix4[]) {
  const instances = new InstancedMesh(context.track(mesh.geometry), material, matrices.length);
  matrices.forEach((matrix, i) => instances.setMatrixAt(i, scratch.multiplyMatrices(matrix, mesh.matrixWorld)));
  instances.instanceMatrix.needsUpdate = true;
  instances.computeBoundingSphere();
  return instances;
}

/** Per-instance values the LED shader needs. */
export function setLedAttributes(mesh: Mesh, seeds: number[], alerts: number[]) {
  mesh.geometry.setAttribute("aSeed", new InstancedBufferAttribute(new Float32Array(seeds), 1));
  mesh.geometry.setAttribute("aAlert", new InstancedBufferAttribute(new Float32Array(alerts), 1));
}

export const identity = () => new Matrix4();
