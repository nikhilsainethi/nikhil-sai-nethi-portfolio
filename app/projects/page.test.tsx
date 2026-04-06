import { render, screen } from "@testing-library/react";
import ProjectsPage from "./page";

describe("Projects page", () => {
  it("renders the flagship RAG case study and supporting engineering logs", () => {
    render(<ProjectsPage />);

    expect(
      screen.getByRole("heading", { name: "Internal RAG Search Engine" }),
    ).toBeInTheDocument();
    expect(screen.getByText("System Highlights")).toBeInTheDocument();
    expect(screen.getByText("LLM Observability Workflows")).toBeInTheDocument();
    expect(screen.getByText("Service Resilience Patterns")).toBeInTheDocument();
    expect(screen.getByText("Release Safety Automation")).toBeInTheDocument();
  });
});
