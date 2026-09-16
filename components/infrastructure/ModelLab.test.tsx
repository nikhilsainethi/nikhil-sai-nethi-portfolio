import React from "react";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import ModelLab from "./ModelLab";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: true, media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    })),
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("interactive model lab", () => {
  it("hydrates consistently before applying the device reduced-motion preference", async () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ModelLab />);
    document.body.appendChild(container);
    expect(container.querySelector("section")).toHaveAttribute("data-motion", "true");
    const recoverableError = vi.fn();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <ModelLab />, { onRecoverableError: recoverableError });
    });
    expect(container.querySelector("section")).toHaveAttribute("data-motion", "false");
    expect(recoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    await act(async () => root.unmount());
    container.remove();
  });

  it("lets a visitor introduce, diagnose, and repair a broken model", async () => {
    const user = userEvent.setup();
    render(<ModelLab motionEnabled={false} />);
    await user.click(screen.getByRole("button", { name: "Inject fault" }));
    await user.click(screen.getByRole("button", { name: "Validate model" }));
    expect(screen.getByRole("status")).toHaveTextContent("1 issue found");
    expect(screen.getByRole("status")).toHaveTextContent("missing-controller");
    await user.click(screen.getByRole("button", { name: "Repair model" }));
    await user.click(screen.getByRole("button", { name: "Validate model" }));
    expect(screen.getByRole("status")).toHaveTextContent("All checks passed");
    expect(screen.getByRole("status")).not.toHaveTextContent("missing-controller");
  });

  it("clears stale validation when the platform changes", async () => {
    const user = userEvent.setup();
    render(<ModelLab motionEnabled={false} />);
    await user.click(screen.getByRole("button", { name: "Validate model" }));
    expect(screen.getByRole("status")).toHaveTextContent("All checks passed");
    await user.click(screen.getByRole("button", { name: /ARM Compute/ }));
    expect(screen.getByRole("status")).not.toHaveTextContent("All checks passed");
    expect(screen.getByRole("status")).toHaveTextContent("Ready to validate");
    expect(screen.getByRole("button", { name: /ARM Compute/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "Inspect Accelerator 01" })).not.toBeInTheDocument();
  });

  it("validates a duplicate slot and resets it when changing revision", async () => {
    const user = userEvent.setup();
    render(<ModelLab motionEnabled={false} />);
    await user.selectOptions(screen.getByLabelText("Fault scenario"), "duplicate-slot");
    await user.click(screen.getByRole("button", { name: "Inject fault" }));
    await user.click(screen.getByRole("button", { name: "Validate model" }));
    expect(screen.getByRole("status")).toHaveTextContent("DIMM_A1");
    await user.click(screen.getByRole("button", { name: "Revision 1.1" }));
    expect(screen.getByRole("status")).toHaveTextContent("Ready to validate");
    await user.click(screen.getByRole("button", { name: "Validate model" }));
    expect(screen.getByRole("status")).toHaveTextContent("All checks passed");
  });

  it("shows the selected component properties and relationships", async () => {
    const user = userEvent.setup();
    render(<ModelLab motionEnabled={false} />);
    await user.click(screen.getByRole("button", { name: "Inspect Network adapter" }));
    const inspector = screen.getByRole("region", { name: "Component inspector" });
    expect(within(inspector).getByRole("heading", { name: "Network adapter" })).toBeInTheDocument();
    expect(inspector).toHaveTextContent("100 Gb/s");
    expect(inspector).toHaveTextContent("cpu-0");
  });

  it("shows concrete revision changes on demand", async () => {
    const user = userEvent.setup();
    render(<ModelLab motionEnabled={false} />);
    await user.click(screen.getByRole("button", { name: "Compare revisions" }));
    const comparison = screen.getByRole("region", { name: "Revision comparison" });
    expect(comparison).toHaveTextContent("memory-1");
    expect(comparison).toHaveTextContent("memory-legacy");
    expect(comparison).toHaveTextContent("100 Gb/s → 200 Gb/s");
    expect(comparison).toHaveTextContent("2 added");
    expect(comparison).toHaveTextContent("1 removed");
  });

  it("exports the current model as JSON, including its selected platform and revision", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn((blob: Blob) => `blob:machine-model-${blob.size}`);
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<ModelLab motionEnabled={false} />);
    await user.click(screen.getByRole("button", { name: /ARM Compute/ }));
    await user.click(screen.getByRole("button", { name: "Revision 1.1" }));
    await user.click(screen.getByRole("button", { name: "Export JSON" }));
    expect(createObjectURL).toHaveBeenCalledOnce();
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    const serialized = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(blob);
    });
    expect(JSON.parse(serialized)).toMatchObject({ platform: "arm", revision: "1.1", synthetic: true });
    expect(anchorClick).toHaveBeenCalledOnce();
  });
});
