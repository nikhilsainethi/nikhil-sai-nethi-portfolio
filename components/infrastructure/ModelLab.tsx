"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSystemReducedMotion } from "./InfrastructureShell";
import {
  createMachineModel, diffMachineModels, injectModelFault, validateMachineModel,
  type EntityKind, type Fault, type ModelEntity, type Platform, type Revision, type ValidationIssue,
} from "@/lib/machine-model";
import styles from "./ModelLab.module.css";

const platforms: { id: Platform; title: string; label: string }[] = [
  { id: "x86", title: "x86", label: "General purpose" },
  { id: "arm", title: "ARM", label: "Compute" },
  { id: "accelerator", title: "GPU", label: "Accelerator" },
];

function ComponentIcon({ kind }: { kind: EntityKind }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
      {kind === "chassis" || kind === "board" ? <>
        <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 9h10M7 13h6M17 13v2" />
      </> : kind === "memory" ? <>
        <rect x="2" y="7" width="20" height="9" rx="1" /><path d="M6 10v3m4-3v3m4-3v3m4-3v3M5 16v3m4-3v3m6-3v3m4-3v3" />
      </> : kind === "nic" ? <>
        <rect x="6" y="3" width="12" height="8" rx="1" /><path d="M12 11v5M4 20v-4h16v4M12 16v4M9 7h6" />
      </> : <>
        <rect x="5" y="5" width="14" height="14" rx="2" /><rect x="9" y="9" width="6" height="6" rx="1" />
        <path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3M19 9h3m-3 6h3" />
      </>}
    </svg>
  );
}

export function ModelLab({ motionEnabled = true }: { motionEnabled?: boolean }) {
  const reducedMotion = useSystemReducedMotion();
  const animate = motionEnabled && !reducedMotion;
  const [model, setModel] = useState(() => createMachineModel("accelerator", "1.0"));
  const [selectedId, setSelectedId] = useState("gpu-0");
  const [fault, setFault] = useState<Fault>("missing-reference");
  const [injectedFault, setInjectedFault] = useState<Fault | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[] | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [exported, setExported] = useState(false);
  const selected = model.entities.find((entity) => entity.id === selectedId) ?? model.entities[0];
  const difference = useMemo(() => diffMachineModels(
    createMachineModel(model.platform, "1.0"), createMachineModel(model.platform, "1.1"),
  ), [model.platform]);
  const connections = model.relations.filter((relation) => relation.source === selected.id || relation.target === selected.id);

  function switchModel(platform: Platform, revision: Revision) {
    const next = createMachineModel(platform, revision);
    setModel(next);
    if (!next.entities.some((entity) => entity.id === selectedId)) setSelectedId("cpu-0");
    setIssues(null);
    setInjectedFault(null);
    setExported(false);
  }

  function injectFault() {
    setModel(injectModelFault(createMachineModel(model.platform, model.revision), fault));
    setInjectedFault(fault);
    setIssues(null);
    setExported(false);
  }

  function exportModel() {
    const blob = new Blob([JSON.stringify(model, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `synthetic-${model.platform}-v${model.revision}${injectedFault ? "-fault" : ""}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Let the browser begin the download before releasing the object URL.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(true);
  }

  function node(entity: ModelEntity, index: number, wide = false) {
    const isSelected = selected.id === entity.id;
    const isInvalid = issues?.some((issue) => issue.entityId === entity.id);
    return (
      <motion.button
        key={entity.id} type="button" className={`${styles.node} ${wide ? styles.wideNode : ""}`}
        aria-label={`Inspect ${entity.name}`} aria-pressed={isSelected}
        data-selected={isSelected} data-invalid={Boolean(isInvalid)}
        initial={animate ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }} transition={{ duration: animate ? 0.3 : 0, delay: animate ? index * 0.035 : 0 }}
        whileHover={animate ? { y: -3 } : undefined} whileTap={animate ? { scale: 0.97 } : undefined}
        onClick={() => setSelectedId(entity.id)}
      >
        <span className={styles.nodeIcon}><ComponentIcon kind={entity.kind} /></span>
        <span className={styles.nodeText}><span className={styles.nodeKind}>{entity.kind}</span><span className={styles.nodeName}>{entity.name}</span><span className={styles.nodeId}>{entity.id}</span></span>
        <span className={styles.nodeDot} aria-hidden="true" />
      </motion.button>
    );
  }

  return (
    <section id="model-lab" className={styles.section} aria-labelledby="model-lab-title" data-motion={animate}>
      <div className={styles.sectionHeading}>
        <div><p className={styles.eyebrow}><span />01 / INTERACTIVE MODEL LAB</p><h2 id="model-lab-title">Every machine.<br /> <span>A model.</span></h2></div>
        <div className={styles.intro}><p>Complex hardware. Clear relationships. Explore the model underneath a machine, then put its integrity to the test.</p><span className={styles.syntheticLabel}><span />Synthetic data · Runs in your browser</span></div>
      </div>

      <div className={styles.workbench}>
        <div className={styles.workbenchHeader}><div className={styles.workbenchTitle}><span className={styles.windowMark} aria-hidden="true">⌘</span> MACHINE MODEL LAB <span className={styles.version}>v1.0</span></div><span className={styles.localLabel}>LOCAL WORKSPACE <span /></span></div>
        <div className={styles.toolbar}>
          <div className={styles.platformControls} role="group" aria-label="Machine platform">
            {platforms.map((platform) => <button type="button" key={platform.id} aria-label={`${platform.title} ${platform.label}`} aria-pressed={model.platform === platform.id} className={styles.platformButton} onClick={() => switchModel(platform.id, model.revision)}><strong>{platform.title}</strong><span>{platform.label}</span></button>)}
          </div>
          <div className={styles.revisions} role="group" aria-label="Model revision"><span>REVISION</span>{(["1.0", "1.1"] as const).map((revision) => <button type="button" aria-label={`Revision ${revision}`} aria-pressed={model.revision === revision} key={revision} onClick={() => switchModel(model.platform, revision)}>{revision}</button>)}</div>
        </div>

        <div className={styles.workspace}>
          <div className={styles.topology}>
            <div className={styles.panelHeading}><span>ENTITY TOPOLOGY</span><span>{model.entities.length} entities <i /> {model.relations.length} relations</span></div>
            <div className={styles.graphHint}>Select a component to inspect its model <span aria-hidden="true">↗</span></div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={`${model.platform}-${model.revision}`} className={styles.graph} initial={animate ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} exit={animate ? { opacity: 0, y: -8 } : undefined} transition={{ duration: animate ? 0.2 : 0 }}>
                <div className={styles.rootNode}>{node(model.entities[0], 0, true)}</div>
                <div className={styles.graphConnector}><span>contains</span></div>
                <div className={styles.boardNode}>{node(model.entities[1], 1, true)}</div>
                <div className={styles.graphConnector}><span>contains</span></div>
                <div className={styles.componentGrid}>{model.entities.slice(2).map((entity, index) => node(entity, index + 2))}</div>
              </motion.div>
            </AnimatePresence>
            <div className={styles.graphLegend}><span><i /> Containment hierarchy</span><span><i /> Select to trace connections</span></div>
          </div>

          <section className={styles.inspector} aria-label="Component inspector">
            <div className={styles.panelHeading}><span>COMPONENT INSPECTOR</span><span aria-hidden="true">↗</span></div>
            <motion.div key={`${selected.id}-${model.revision}`} initial={animate ? { opacity: 0, x: 8 } : false} animate={{ opacity: 1, x: 0 }} transition={{ duration: animate ? 0.2 : 0 }}>
              <div className={styles.inspectorIcon}><ComponentIcon kind={selected.kind} /></div>
              <span className={styles.inspectorKind}>{selected.kind}</span><h3>{selected.name}</h3><code className={styles.inspectorId}>{selected.id}</code>
              <dl className={styles.attributes}>{Object.entries(selected.attributes).map(([key, value]) => <div key={key}><dt>{key.replace(/([A-Z])/g, " $1")}</dt><dd>{value}</dd></div>)}</dl>
              <p className={styles.connectionHeading}>RELATIONSHIPS <span>{connections.length}</span></p>
              <ul className={styles.connectionList}>{connections.map((relation, index) => <li key={`${relation.source}-${relation.target}-${index}`}><span>{relation.target === selected.id ? (relation.kind === "contains" ? "contained by" : "connected from") : relation.kind}</span><code>{relation.target === selected.id ? relation.source : relation.target}</code></li>)}</ul>
            </motion.div>
          </section>
        </div>

        <div className={styles.validationArea}>
          <div className={styles.validationIntro}><span className={styles.miniIndex}>01—03</span><h3>Break it. Understand it. Repair it.</h3><p>Introduce a fault and let the model explain what went wrong.</p></div>
          <div className={styles.validationControls}>
            <label className={styles.faultSelect}><span>Fault scenario</span><select value={fault} onChange={(event) => setFault(event.target.value as Fault)}><option value="missing-reference">Missing reference</option><option value="duplicate-slot">Duplicate slot</option></select></label>
            <button type="button" className={styles.secondaryButton} onClick={injectFault}>Inject fault <span aria-hidden="true">＋</span></button>
            <button type="button" className={styles.primaryButton} onClick={() => setIssues(validateMachineModel(model))}>Validate model <span aria-hidden="true">↗</span></button>
            {injectedFault && <button type="button" className={styles.repairButton} onClick={() => switchModel(model.platform, model.revision)}>Repair model <span aria-hidden="true">↺</span></button>}
          </div>
          <div role="status" aria-live="polite" aria-atomic="true" className={styles.validationResult} data-state={issues === null ? "idle" : issues.length ? "error" : "success"}>
            <span className={styles.statusIcon} aria-hidden="true">{issues === null ? "○" : issues.length ? "!" : "✓"}</span>
            <div><strong>{issues === null ? (injectedFault ? "Fault injected — ready to validate" : "Ready to validate") : issues.length ? `${issues.length} issue${issues.length === 1 ? "" : "s"} found` : "All checks passed"}</strong>
              {issues?.length ? <ul>{issues.map((issue, index) => <li key={`${issue.code}-${index}`}>{issue.message}</li>)}</ul> : <p>{issues === null ? "Check entity IDs, references, slot allocation, relationship types, and containment cycles." : `${model.entities.length} entities and ${model.relations.length} relationships checked. The model is consistent.`}</p>}
            </div>
          </div>
        </div>

        <div className={styles.bottomToolbar}>
          <button type="button" className={styles.textButton} aria-expanded={comparisonOpen} aria-controls="model-revision-comparison" aria-label="Compare revisions" onClick={() => setComparisonOpen(!comparisonOpen)}><span aria-hidden="true">⌥</span>Compare revisions <span className={styles.compareLabel}>1.0 → 1.1</span><span aria-hidden="true">{comparisonOpen ? "−" : "+"}</span></button>
          <button type="button" className={styles.textButton} aria-label="Export JSON" onClick={exportModel}>{exported ? "Export again" : "Export JSON"}<span aria-hidden="true">↓</span></button>
        </div>
        {comparisonOpen && <motion.section id="model-revision-comparison" aria-label="Revision comparison" className={styles.comparison} initial={animate ? { opacity: 0, y: -8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: animate ? 0.25 : 0 }}>
          <div className={styles.diffHeader}><h3>What changed in 1.1</h3><p>Compares the original {platforms.find((item) => item.id === model.platform)?.title} fixtures; injected faults are excluded.</p></div>
          <div className={styles.diffGrid}>
            <div className={styles.added}><h4>＋ {difference.added.length} added</h4>{difference.added.map((entity) => <p key={entity.id}><code>{entity.id}</code><span>{entity.name} · {entity.attributes.capacity ?? entity.attributes.speed}</span></p>)}</div>
            <div className={styles.removed}><h4>− {difference.removed.length} removed</h4>{difference.removed.map((entity) => <p key={entity.id}><code>{entity.id}</code><span>{entity.name} · {entity.attributes.capacity}</span></p>)}</div>
            <div className={styles.changed}><h4>~ {difference.changed.length} changed</h4>{difference.changed.map((entity) => <div key={entity.id}><code>{entity.id}</code>{entity.changes.map((change) => <p key={change.field}><span>{change.field.replace("attributes.", "")}</span>{change.before ?? "unset"} → {change.after ?? "unset"}</p>)}</div>)}</div>
          </div>
          <details className={styles.relationDiff}><summary>Relationship changes · +{difference.relationsAdded.length} / −{difference.relationsRemoved.length}</summary>{[{ symbol: "+", relations: difference.relationsAdded }, { symbol: "−", relations: difference.relationsRemoved }].map(({ symbol, relations }) => relations.map((relation, index) => <p key={`${symbol}-${index}`}><span>{symbol}</span><code>{relation.source} → {relation.target}</code><span>{relation.kind}</span></p>))}</details>
        </motion.section>}
      </div>
      <div className={styles.sectionFootnote}><span>MODEL → VALIDATE → EVOLVE</span><p>A personal exploration of hardware modeling. Synthetic configurations, independent of Google systems.</p></div>
    </section>
  );
}

export default ModelLab;
