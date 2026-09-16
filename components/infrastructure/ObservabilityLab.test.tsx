import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import ObservabilityLab from "./ObservabilityLab";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn((media: string) => ({
      matches: true,
      media,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});
afterEach(cleanup);

describe("observability signal lab", () => {
  it("correlates a latency incident with its trace and logs, then restores the healthy metrics", async () => {
    const user = userEvent.setup();
    render(<ObservabilityLab motionEnabled={false} />);
    const metrics = screen.getByRole("region", {
      name: "Request sample metrics",
    });
    expect(metrics).toHaveTextContent("62 ms");
    expect(metrics).toHaveTextContent("0%");
    await user.click(
      screen.getByRole("button", { name: "Inject slow lookup" }),
    );
    expect(metrics).toHaveTextContent("438 ms");
    expect(metrics).toHaveTextContent("15%");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Latency alert firing",
    );
    await user.click(screen.getByRole("button", { name: "Traces" }));
    const trace = screen.getByRole("region", {
      name: "Selected request trace",
    });
    expect(trace).toHaveTextContent("460 ms");
    expect(trace).toHaveTextContent("94%");
    expect(trace).toHaveTextContent("model-store");
    const traceId = within(trace).getByTestId("selected-trace-id").textContent;
    await user.click(screen.getByRole("button", { name: "Logs" }));
    const logs = screen.getByRole("region", {
      name: "Correlated request logs",
    });
    expect(logs).toHaveTextContent(traceId!);
    expect(logs).toHaveTextContent("Model lookup failed in 460 ms");
    await user.click(screen.getByRole("button", { name: "Recover service" }));
    expect(metrics).toHaveTextContent("62 ms");
    expect(metrics).toHaveTextContent("0%");
    expect(screen.getByRole("status")).toHaveTextContent("Latency alert clear");
    expect(
      screen.getByRole("button", { name: "Recover service" }),
    ).toHaveFocus();
  });

  it("recalculates the alert for a user-selected demonstration threshold", async () => {
    const user = userEvent.setup();
    render(<ObservabilityLab motionEnabled={false} />);
    await user.click(
      screen.getByRole("button", { name: "Inject slow lookup" }),
    );
    await user.selectOptions(
      screen.getByLabelText("Sample p95 alert threshold"),
      "500",
    );
    expect(screen.getByRole("status")).toHaveTextContent("Latency alert clear");
    expect(screen.getByRole("status")).toHaveTextContent("500 ms");
    expect(
      screen.getByRole("region", { name: "Request sample metrics" }),
    ).toHaveTextContent("15%");
  });

  it("selects a request from the chart and shows evidence for that exact sample", async () => {
    const user = userEvent.setup();
    render(<ObservabilityLab motionEnabled={false} />);
    await user.click(
      screen.getByRole("button", { name: "Inject slow lookup" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Inspect req-01, 44 ms, ok" }),
    );
    expect(screen.getByRole("button", { name: "Traces" })).toHaveFocus();
    expect(
      screen.getByRole("region", { name: "Selected request trace" }),
    ).toHaveTextContent("req-01");
    expect(
      screen.getByRole("region", { name: "Selected request trace" }),
    ).toHaveTextContent("16 ms");
    await user.click(screen.getByRole("button", { name: "Logs" }));
    expect(
      screen.getByRole("region", { name: "Correlated request logs" }),
    ).toHaveTextContent("Model lookup completed in 16 ms");
    expect(
      screen.getByRole("region", { name: "Correlated request logs" }),
    ).not.toHaveTextContent("460 ms");
  });
});
