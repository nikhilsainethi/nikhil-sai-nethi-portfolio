import { render, screen } from "@testing-library/react";
import { resumePath } from "@/lib/site";
import Home from "./page";

// Mock framer-motion components to avoid test issues with animated paths/svgs
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock CharReveal to just render text
vi.mock("@/components/portfolio/CharReveal", () => ({
  CharReveal: ({ text }: { text: string }) => <span>{text}</span>,
}));

describe("Home page", () => {
  it("renders the hero content and basic structure", () => {
    const { container } = render(<Home />);

    expect(screen.getByText(/Nikhil/)).toBeInTheDocument();
    expect(screen.getByText(/Sai Nethi/)).toBeInTheDocument();

    expect(
      screen.getByText(/Software Engineer · Cloud · Observability · AI\/LLM/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Resume/i })
    ).toHaveAttribute("href", resumePath);
    expect(screen.getByRole("link", { name: /Explore Work/i })).toHaveAttribute(
      "href",
      "#experience",
    );

    const pageShell = container.querySelector("main");
    expect(pageShell).toHaveClass("text-foreground");
    expect(pageShell).not.toHaveClass("text-white");
  });

  it("keeps the hero focused on summary information", () => {
    render(<Home />);

    expect(screen.getAllByText("Charlotte").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Moody's/i).length).toBeGreaterThan(0);
  });
});
