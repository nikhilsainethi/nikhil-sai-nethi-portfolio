import { render, screen } from "@testing-library/react";
import TechStackPage from "./page";

describe("Tech stack page", () => {
  it("renders the grouped skill categories for the dedicated page", () => {
    render(<TechStackPage />);

    expect(screen.getByRole("heading", { name: "Tech Stack" })).toBeInTheDocument();
    expect(screen.getByText("Languages")).toBeInTheDocument();
    expect(screen.getByText("Cloud / Platform")).toBeInTheDocument();
    expect(screen.getByText("Observability / Networking")).toBeInTheDocument();
    expect(screen.getByText("AI / LLM")).toBeInTheDocument();
  });
});
