export type Platform = "x86" | "arm" | "accelerator";
export type Revision = "1.0" | "1.1";
export type Fault = "missing-reference" | "duplicate-slot";
export type EntityKind = "chassis" | "board" | "cpu" | "memory" | "gpu" | "nic";
export interface ModelEntity {
  id: string;
  kind: EntityKind;
  name: string;
  attributes: Record<string, string>;
}
export interface ModelRelation { source: string; target: string; kind: "contains" | "connects" }
export interface MachineModel {
  schemaVersion: "1.0";
  synthetic: true;
  platform: Platform;
  revision: Revision;
  entities: ModelEntity[];
  relations: ModelRelation[];
}
export interface ValidationIssue { code: string; message: string; entityId?: string }
export interface ModelDiff {
  added: ModelEntity[];
  removed: ModelEntity[];
  changed: { id: string; name: string; changes: { field: string; before?: string; after?: string }[] }[];
  relationsAdded: ModelRelation[];
  relationsRemoved: ModelRelation[];
}
export function createMachineModel(platform: Platform, revision: Revision): MachineModel {
  const accelerated = platform === "accelerator";
  const entities: ModelEntity[] = [
    { id: "chassis-0", kind: "chassis", name: accelerated ? "Accelerator chassis" : "Compute chassis", attributes: { formFactor: accelerated ? "4U" : "2U", family: "Synthetic reference", cooling: "Air" } },
    { id: "board-0", kind: "board", name: "System board", attributes: { slot: "BOARD_0", generation: "Reference A", interconnect: "PCIe" } },
    { id: "cpu-0", kind: "cpu", name: platform === "arm" ? "ARM processor" : "x86 processor", attributes: { slot: "SOCKET_0", architecture: platform === "arm" ? "ARM64" : "x86-64", cores: platform === "arm" ? "64" : "32" } },
    { id: "memory-0", kind: "memory", name: "Primary memory", attributes: { slot: "DIMM_A1", capacity: "64 GB", technology: "DDR5" } },
    ...(revision === "1.0"
      ? [{ id: "memory-legacy", kind: "memory" as const, name: "Legacy memory", attributes: { slot: "DIMM_B1", capacity: "32 GB", technology: "DDR5" } }]
      : [{ id: "memory-1", kind: "memory" as const, name: "Expanded memory", attributes: { slot: "DIMM_B1", capacity: "64 GB", technology: "DDR5" } }]),
    { id: "nic-0", kind: "nic", name: "Network adapter", attributes: { slot: "PCIE_1", speed: revision === "1.0" ? "100 Gb/s" : "200 Gb/s", ports: "2" } },
    ...(revision === "1.1" ? [{ id: "nic-1", kind: "nic" as const, name: "Fabric adapter", attributes: { slot: "PCIE_2", speed: "200 Gb/s", ports: "2" } }] : []),
    ...(accelerated ? [0, 1].map((index): ModelEntity => ({ id: `gpu-${index}`, kind: "gpu", name: `Accelerator ${String(index + 1).padStart(2, "0")}`, attributes: { slot: `ACCEL_${index}`, memory: "80 GB", interconnect: "PCIe", role: "Synthetic GPU" } })) : []),
  ];
  const relations: ModelRelation[] = [
    { source: "chassis-0", target: "board-0", kind: "contains" },
    ...entities.filter((entity) => entity.kind !== "chassis" && entity.kind !== "board")
      .map((entity): ModelRelation => ({ source: "board-0", target: entity.id, kind: "contains" })),
    ...entities.filter((entity) => ["memory", "nic", "gpu"].includes(entity.kind))
      .map((entity): ModelRelation => ({ source: entity.id, target: "cpu-0", kind: "connects" })),
  ];
  return { schemaVersion: "1.0", synthetic: true, platform, revision, entities, relations };
}
export function validateMachineModel(model: MachineModel): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const entities = new Map<string, ModelEntity>();
  for (const entity of model.entities) {
    if (entities.has(entity.id)) {
      issues.push({ code: "duplicate-id", entityId: entity.id, message: `Entity id "${entity.id}" is defined more than once.` });
    }
    entities.set(entity.id, entity);
  }
  const occupied = new Map<string, string>();
  const children = new Map<string, string[]>();
  for (const relation of model.relations) {
    if (relation.kind !== "contains" && relation.kind !== "connects") {
      issues.push({ code: "invalid-relation", message: `Unknown relationship type "${relation.kind}". Use contains or connects.` });
      continue;
    }
    for (const id of [relation.source, relation.target]) {
      if (!entities.has(id)) issues.push({ code: "missing-reference", entityId: id, message: `${relation.source} → ${relation.target} references missing entity "${id}".` });
    }
    if (relation.kind !== "contains") continue;
    const existingChildren = children.get(relation.source) ?? [];
    existingChildren.push(relation.target);
    children.set(relation.source, existingChildren);
    const slot = entities.get(relation.target)?.attributes.slot;
    if (slot) {
      const key = JSON.stringify([relation.source, slot]);
      const occupant = occupied.get(key);
      if (occupant && occupant !== relation.target) {
        issues.push({ code: "duplicate-slot", entityId: relation.target, message: `Slot ${slot} in ${relation.source} is occupied by both ${occupant} and ${relation.target}.` });
      }
      occupied.set(key, relation.target);
    }
  }
  // Only containment has a tree constraint. Bidirectional connectivity is valid.
  const visited = new Set<string>();
  const active = new Set<string>();
  function visit(id: string) {
    if (active.has(id)) {
      issues.push({ code: "containment-cycle", entityId: id, message: `Containment cycle reaches "${id}". A component cannot contain its own ancestor.` });
      return;
    }
    if (visited.has(id)) return;
    visited.add(id);
    active.add(id);
    for (const child of children.get(id) ?? []) visit(child);
    active.delete(id);
  }
  for (const id of entities.keys()) visit(id);
  return issues;
}
export function injectModelFault(model: MachineModel, fault: Fault): MachineModel {
  const copy = structuredClone(model);
  if (fault === "missing-reference") {
    copy.relations.push({ source: "nic-0", target: "missing-controller", kind: "connects" });
  } else {
    const secondMemory = copy.entities.find((entity) => entity.kind === "memory" && entity.id !== "memory-0");
    if (secondMemory) secondMemory.attributes.slot = "DIMM_A1";
  }
  return copy;
}
export function diffMachineModels(before: MachineModel, after: MachineModel): ModelDiff {
  const oldEntities = new Map(before.entities.map((entity) => [entity.id, entity]));
  const newEntities = new Map(after.entities.map((entity) => [entity.id, entity]));
  const added = after.entities.filter((entity) => !oldEntities.has(entity.id));
  const removed = before.entities.filter((entity) => !newEntities.has(entity.id));
  const changed: ModelDiff["changed"] = [];
  for (const entity of after.entities) {
    const previous = oldEntities.get(entity.id);
    if (!previous) continue;
    const changes: ModelDiff["changed"][number]["changes"] = [];
    for (const field of ["name", "kind"] as const) {
      if (previous[field] !== entity[field]) changes.push({ field, before: previous[field], after: entity[field] });
    }
    const keys = new Set([...Object.keys(previous.attributes), ...Object.keys(entity.attributes)]);
    for (const key of keys) {
      if (previous.attributes[key] !== entity.attributes[key]) {
        changes.push({ field: `attributes.${key}`, before: previous.attributes[key], after: entity.attributes[key] });
      }
    }
    if (changes.length) changed.push({ id: entity.id, name: entity.name, changes });
  }
  const key = (relation: ModelRelation) => JSON.stringify([relation.source, relation.kind, relation.target]);
  const oldRelations = new Set(before.relations.map(key));
  const newRelations = new Set(after.relations.map(key));
  return {
    added, removed, changed,
    relationsAdded: after.relations.filter((relation) => !oldRelations.has(key(relation))),
    relationsRemoved: before.relations.filter((relation) => !newRelations.has(key(relation))),
  };
}
