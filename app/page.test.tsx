import { render, screen, within } from "@testing-library/react";
import { resumePath } from "@/lib/site";
import Home from "./page";

describe("Home page", () => {
  it("renders the required navigation, sections, and resume download link", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "#about",
    );
    expect(screen.getByRole("link", { name: "Experience" })).toHaveAttribute(
      "href",
      "#experience",
    );
    expect(screen.getByRole("link", { name: "Tech Stack" })).toHaveAttribute(
      "href",
      "#tech-stack",
    );
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "#projects",
    );
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "#contact",
    );

    expect(
      screen.getByRole("heading", { name: "Nikhil Sai Nethi" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tech Stack" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Internal RAG Search Engine" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Download Resume" })).toHaveAttribute(
      "href",
      resumePath,
    );
  });

  it("renders the experience timeline in the intended order with the Moody's focus technologies", () => {
    render(<Home />);

    const companyNames = screen
      .getAllByRole("heading", { level: 3 })
      .slice(0, 3)
      .map((heading) => heading.textContent);

    expect(companyNames).toEqual([
      "Moody's Corporation",
      "Verisk Analytics",
      "Nokia Solutions & Networks",
    ]);

    const moodysCard = screen
      .getByRole("heading", { name: "Moody's Corporation" })
      .closest("article");

    expect(moodysCard).not.toBeNull();

    const moodysContent = within(moodysCard as HTMLElement);
    expect(moodysContent.getByText("EKS")).toBeInTheDocument();
    expect(moodysContent.getByText("Prometheus")).toBeInTheDocument();
    expect(moodysContent.getByText("OpenTelemetry")).toBeInTheDocument();
    expect(moodysContent.getByText("RAG")).toBeInTheDocument();
    expect(moodysContent.getByText("LangChain")).toBeInTheDocument();
  });

  it("shows the projects section with the RAG search engine", () => {
    render(<Home />);

    const projectHeading = screen.getByRole("heading", {
      level: 2,
      name: "Internal RAG Search Engine",
    });

    expect(projectHeading).toBeInTheDocument();
  });
});
