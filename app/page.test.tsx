import { render, screen, within } from "@testing-library/react";
import { resumePath } from "@/lib/site";
import Home from "./page";

describe("Home page", () => {
  it("renders only the hero content and route-level calls to action", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Nikhil Sai Nethi" })).toBeInTheDocument();
    expect(
      screen.getByText(/Cloud & Infrastructure/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Download Resume" }),
    ).toHaveAttribute("href", resumePath);
    expect(screen.getByRole("link", { name: /View Projects/i })).toHaveAttribute(
      "href",
      "/projects",
    );

    expect(screen.queryByRole("heading", { name: "Experience" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Tech Stack" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Internal RAG Search Engine" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Contact" })).not.toBeInTheDocument();
  });

  it("keeps the hero focused on summary information rather than embedded sections", () => {
    render(<Home />);

    expect(screen.getByText("Charlotte, NC")).toBeInTheDocument();
    expect(screen.getByText(/Moody's Corporation/i)).toBeInTheDocument();
    expect(screen.getByText(/RAG workflows/i)).toBeInTheDocument();
    expect(
      within(screen.getByRole("main")).queryByText(/Certified Kubernetes Administrator/i),
    ).not.toBeInTheDocument();
  });
});
