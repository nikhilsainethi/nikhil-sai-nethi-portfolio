import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CinematicHero } from "./CinematicHero";

const preference = vi.hoisted(() => ({ enabled: true }));
vi.mock("./InfrastructureShell", () => ({
  useInfrastructureMotion: () => preference.enabled,
}));
vi.mock("./CinematicInfrastructure", () => ({
  CinematicInfrastructure: () => <div aria-hidden="true" />,
}));

vi.mock("./DatacentreCanvas", () => ({
  DatacentreCanvas: () => <canvas aria-hidden="true" />,
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  preference.enabled = true;
});

function setSceneWidth(surface: HTMLElement, width = 1000) {
  vi.spyOn(surface, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, 0, width, 740),
  );
}

function movePointer(
  target: Element,
  clientX: number,
  pointerType: "mouse" | "touch" = "mouse",
) {
  // Dispatch the browser event shape without relying on jsdom's PointerEvent support.
  const event = new MouseEvent("pointermove", { bubbles: true, clientX });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  fireEvent(target, event);
}

describe("cinematic portfolio introduction", () => {
  it("keeps the experience and monitoring actions available immediately", () => {
    render(<CinematicHero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Complex systems.Clear signals.",
    );
    expect(
      screen.getByRole("link", { name: /Explore my experience/ }),
    ).toHaveAttribute("href", "#work");
    expect(
      screen.getByRole("link", { name: /Follow the signals/ }),
    ).toHaveAttribute("href", "#infrastructure-story");
    expect(
      screen.getByText(/Incoming Platform Infrastructure Engineer/),
    ).toBeVisible();
  });

  it("lets visitors directly scrub the scene and reads out its selected stage", () => {
    render(<CinematicHero />);
    const timeline = screen.getByRole("slider", {
      name: "Explore infrastructure scene",
    });
    fireEvent.change(timeline, { target: { value: "85" } });
    expect(timeline).toHaveValue("85");
    expect(timeline).toHaveAttribute("aria-valuetext", "85% — Request context");
    expect(screen.getByTestId("hero-scene-stage")).toHaveTextContent(
      "Request context",
    );
  });

  it("keeps manual scene selection usable when decorative motion is off", () => {
    preference.enabled = false;
    render(<CinematicHero />);
    expect(
      screen.getByRole("region", { name: "Portfolio introduction" }),
    ).toHaveAttribute("data-motion", "off");
    fireEvent.change(screen.getByRole("slider"), { target: { value: "50" } });
    expect(screen.getByTestId("hero-scene-stage")).toHaveTextContent(
      "Signals connected",
    );
    expect(screen.getByText(/Scene paused/)).toBeVisible();
  });

  it("scrubs by signed pointer delta and clamps the scene to its endpoints", () => {
    render(<CinematicHero />);
    const surface = screen.getByRole("region", {
      name: "Portfolio introduction",
    });
    const timeline = screen.getByRole("slider");
    setSceneWidth(surface);

    movePointer(surface, 100);
    expect(timeline).toHaveValue("28");
    movePointer(surface, 350);
    expect(timeline).toHaveValue("48");
    movePointer(surface, 100);
    expect(timeline).toHaveValue("28");
    movePointer(surface, 2000);
    expect(timeline).toHaveValue("100");
    expect(timeline).toHaveAttribute(
      "aria-valuetext",
      "100% — Request context",
    );
    movePointer(surface, -1000);
    expect(timeline).toHaveValue("0");
    expect(timeline).toHaveAttribute("aria-valuetext", "0% — Physical layer");
  });

  it("does not scrub from touchscreen movement", () => {
    render(<CinematicHero />);
    const surface = screen.getByRole("region", {
      name: "Portfolio introduction",
    });
    setSceneWidth(surface);
    movePointer(surface, 100, "touch");
    movePointer(surface, 950, "touch");
    movePointer(surface, 20, "touch");
    expect(screen.getByRole("slider")).toHaveValue("28");
  });

  it("ignores pointer movement over interactive controls and their descendants", () => {
    render(<CinematicHero />);
    const surface = screen.getByRole("region", {
      name: "Portfolio introduction",
    });
    const timeline = screen.getByRole("slider");
    const action = screen.getByRole("link", { name: /Explore my experience/ });
    setSceneWidth(surface);
    movePointer(surface, 100);
    movePointer(action, 900);
    expect(timeline).toHaveValue("28");
    movePointer(action.querySelector("span")!, 250);
    expect(timeline).toHaveValue("28");
    movePointer(timeline, 800);
    expect(timeline).toHaveValue("28");
    fireEvent.change(timeline, { target: { value: "67" } });
    expect(timeline).toHaveValue("67");
  });

  it("starts a fresh pointer anchor when the pointer re-enters the introduction", () => {
    render(<CinematicHero />);
    const surface = screen.getByRole("region", {
      name: "Portfolio introduction",
    });
    const timeline = screen.getByRole("slider");
    setSceneWidth(surface);
    movePointer(surface, 100);
    movePointer(surface, 350);
    expect(timeline).toHaveValue("48");
    fireEvent.pointerLeave(surface);
    movePointer(surface, 950);
    expect(timeline).toHaveValue("48");
    movePointer(surface, 1000);
    expect(timeline).toHaveValue("52");
  });

  it("stops pointer scrubbing after motion is paused while retaining manual control", () => {
    const { rerender } = render(<CinematicHero />);
    const surface = screen.getByRole("region", {
      name: "Portfolio introduction",
    });
    const timeline = screen.getByRole("slider");
    setSceneWidth(surface);
    movePointer(surface, 100);
    movePointer(surface, 350);
    expect(timeline).toHaveValue("48");

    preference.enabled = false;
    rerender(<CinematicHero />);
    movePointer(surface, 950);
    expect(timeline).toHaveValue("48");
    expect(surface).toHaveAttribute("data-motion", "off");
    fireEvent.change(timeline, { target: { value: "85" } });
    movePointer(surface, 50);
    expect(timeline).toHaveValue("85");
    expect(timeline).toHaveAttribute("aria-valuetext", "85% — Request context");
  });
});
