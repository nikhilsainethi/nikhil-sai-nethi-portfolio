import { describe, expect, it } from "vitest";
import {
  createMachineModel,
  diffMachineModels,
  injectModelFault,
  validateMachineModel,
  type MachineModel,
  type Platform,
  type Revision,
} from "./machine-model";

describe("synthetic machine fixtures", () => {
  it.each<Platform>(["x86", "arm", "accelerator"])("has valid %s fixtures at both revisions", (platform) => {
    for (const revision of ["1.0", "1.1"] as Revision[]) {
      const model = createMachineModel(platform, revision);
      expect(model.platform).toBe(platform);
      expect(model.revision).toBe(revision);
      expect(model.synthetic).toBe(true);
      expect(model.entities.some((entity) => entity.kind === "cpu")).toBe(true);
      expect(validateMachineModel(model)).toEqual([]);
    }
  });

  it("returns isolated fixtures rather than shared mutable entity attributes", () => {
    const model = createMachineModel("arm", "1.0");
    model.entities[0].attributes.formFactor = "modified";
    expect(createMachineModel("arm", "1.0").entities[0].attributes.formFactor).not.toBe("modified");
  });
});

describe("model validation", () => {
  it("reports dangling links with the missing entity id", () => {
    const model = injectModelFault(createMachineModel("accelerator", "1.0"), "missing-reference");
    expect(validateMachineModel(model)).toContainEqual(expect.objectContaining({
      code: "missing-reference",
      message: expect.stringContaining("missing-controller"),
    }));
  });

  it("rejects duplicate entity ids", () => {
    const model = createMachineModel("x86", "1.0");
    model.entities.push(structuredClone(model.entities[0]));
    expect(validateMachineModel(model).map((issue) => issue.code)).toContain("duplicate-id");
  });

  it("rejects two components occupying the same slot in one container", () => {
    const model = injectModelFault(createMachineModel("x86", "1.0"), "duplicate-slot");
    expect(validateMachineModel(model)).toContainEqual(expect.objectContaining({
      code: "duplicate-slot",
      message: expect.stringContaining("DIMM_A1"),
    }));
  });

  it("allows the same slot name under a different container", () => {
    const model = createMachineModel("x86", "1.0");
    model.entities.push(
      { id: "board-1", kind: "board", name: "Expansion board", attributes: { slot: "BOARD_1" } },
      { id: "memory-2", kind: "memory", name: "Expansion memory", attributes: { slot: "DIMM_A1" } },
    );
    model.relations.push(
      { source: "chassis-0", target: "board-1", kind: "contains" },
      { source: "board-1", target: "memory-2", kind: "contains" },
    );
    expect(validateMachineModel(model)).toEqual([]);
  });

  it("rejects containment cycles but allows connectivity cycles", () => {
    const model = createMachineModel("accelerator", "1.0");
    model.relations.push({ source: "cpu-0", target: "nic-0", kind: "connects" });
    expect(validateMachineModel(model)).toEqual([]);
    model.relations.push({ source: "board-0", target: "chassis-0", kind: "contains" });
    expect(validateMachineModel(model).map((issue) => issue.code)).toContain("containment-cycle");
  });

  it("rejects unknown relationship types from a deserialized model", () => {
    const model = createMachineModel("arm", "1.0");
    model.relations.push({ source: "cpu-0", target: "board-0", kind: "powers" } as unknown as MachineModel["relations"][number]);
    expect(validateMachineModel(model).map((issue) => issue.code)).toContain("invalid-relation");
  });

  it.each(["missing-reference", "duplicate-slot"] as const)("injects %s without mutating the baseline", (fault) => {
    const baseline = createMachineModel("accelerator", "1.0");
    const snapshot = structuredClone(baseline);
    const broken = injectModelFault(baseline, fault);
    expect(baseline).toEqual(snapshot);
    expect(validateMachineModel(baseline)).toEqual([]);
    expect(validateMachineModel(broken)).toHaveLength(1);
  });
});

describe("revision comparison", () => {
  it("reports added, removed, and actual field changes without mutating either revision", () => {
    const before = createMachineModel("accelerator", "1.0");
    const after = createMachineModel("accelerator", "1.1");
    const snapshots = [structuredClone(before), structuredClone(after)];
    const diff = diffMachineModels(before, after);
    expect(diff.added.map((entity) => entity.id)).toEqual(["memory-1", "nic-1"]);
    expect(diff.removed.map((entity) => entity.id)).toEqual(["memory-legacy"]);
    expect(diff.changed).toContainEqual(expect.objectContaining({
      id: "nic-0",
      changes: expect.arrayContaining([{ field: "attributes.speed", before: "100 Gb/s", after: "200 Gb/s" }]),
    }));
    expect(diff.relationsAdded.length).toBeGreaterThan(0);
    expect(diff.relationsRemoved.length).toBeGreaterThan(0);
    expect([before, after]).toEqual(snapshots);
  });

  it("returns an empty diff for identical models", () => {
    const model = createMachineModel("arm", "1.0");
    expect(diffMachineModels(model, structuredClone(model))).toEqual({
      added: [], removed: [], changed: [], relationsAdded: [], relationsRemoved: [],
    });
  });
});
