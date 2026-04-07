import { render, screen, within } from "@testing-library/react";
import { resumePath } from "@/lib/site";
import Home from "./page";

describe("Home page", () => {
  it("renders only the hero content and route-level calls to action", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Nikhil Sai Nethi" })).toBeInTheDocument();
    expect(
      screen.getByText(/Software Engineer · Cloud · Observability · AI\/LLM/i),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /Download Resume/i })[0],
    ).toHaveAttribute("href", resumePath);
    expect(screen.getByRole("link", { name: /View Experience/i })).toHaveAttribute(
      "href",
      "/experience",
    );

    expect(screen.queryByRole("heading", { name: "Experience" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Tech Stack" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Internal RAG Search Engine" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Contact" })).not.toBeInTheDocument();
  });

  it("keeps the hero focused on summary information rather than embedded sections", () => {
    render(<Home />);

    expect(screen.getAllByText("Charlotte, NC").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Moody's/i).length).toBeGreaterThan(0);
    expect(
      within(screen.getByRole("main")).queryByText(/Certified Kubernetes Administrator/i),
    ).toBeInTheDocument();
  });

  it("keeps the hero media rail and action row within a clean single-page layout", () => {
    render(<Home />);

    expect(screen.getByAltText("Nikhil Sai Nethi")).toHaveClass("object-contain");

    const actionRow = screen.getByRole("link", { name: "View Experience" }).parentElement?.parentElement;
    expect(actionRow).toHaveClass("flex-wrap");

    expect(screen.getByTestId("hero-stats")).toHaveClass("grid");
    expect(screen.getByTestId("hero-stats")).toHaveClass("grid-cols-2");

    const locationCard = screen
      .getAllByText("Charlotte, NC")[0]
      .closest("div");
    expect(locationCard?.parentElement).toHaveClass("grid-cols-3");
  });
});
