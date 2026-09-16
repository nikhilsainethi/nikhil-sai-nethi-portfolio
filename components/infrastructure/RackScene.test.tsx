import React from "react";
import { act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { beforeAll, describe, expect, it, vi } from "vitest";
import RackScene from "./RackScene";

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

describe("rack scene server rendering", () => {
  it("hydrates its SVG titles and selected rack without replacing the server-rendered scene", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = document.createElement("div");
    const recoverableErrors: unknown[] = [];
    const scene = <RackScene selected="accelerator" onSelect={() => {}} motionEnabled={false} />;
    let root: Root | undefined;
    document.body.append(container);

    try {
      container.innerHTML = renderToString(scene);
      const serverSvg = container.querySelector("svg");

      await act(async () => {
        root = hydrateRoot(container, scene, {
          onRecoverableError: (error) => { recoverableErrors.push(error); },
        });
      });

      expect(recoverableErrors).toEqual([]);
      expect(container.querySelector("svg")).toBe(serverSvg);
      expect(container.querySelector('g[aria-label="Select accelerator rack"]')).toHaveAttribute("aria-pressed", "true");
      expect(container.querySelector("title")).toHaveTextContent("general compute — select to inspect the synthetic model");
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      await act(async () => { root?.unmount(); });
      container.remove();
      consoleError.mockRestore();
    }
  });

  it("uses the server motion snapshot before applying a browser reduced-motion preference", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = document.createElement("div");
    const recoverableErrors: unknown[] = [];
    const scene = <RackScene selected="accelerator" onSelect={() => {}} motionEnabled />;
    let root: Root | undefined;
    document.body.append(container);

    try {
      container.innerHTML = renderToString(scene);
      const serverSvg = container.querySelector("svg");
      // A server cannot inspect the visitor's device preference. Hydration must
      // use that same snapshot before applying the browser's actual setting.
      expect(container.firstElementChild).toHaveAttribute("data-motion", "on");

      await act(async () => {
        root = hydrateRoot(container, scene, {
          onRecoverableError: (error) => { recoverableErrors.push(error); },
        });
      });

      expect(recoverableErrors).toEqual([]);
      expect(container.querySelector("svg")).toBe(serverSvg);
      expect(container.firstElementChild).toHaveAttribute("data-motion", "off");
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      await act(async () => { root?.unmount(); });
      container.remove();
      consoleError.mockRestore();
    }
  });
});
