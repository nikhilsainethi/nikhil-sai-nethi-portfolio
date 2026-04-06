import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { vi } from "vitest";
import { resumePath } from "@/lib/site";
import { Header } from "./Header";

const { usePathnameMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Header", () => {
  it("renders route navigation and highlights the active page", () => {
    usePathnameMock.mockReturnValue("/projects");

    render(<Header />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "/projects",
    );
    expect(screen.getByRole("link", { name: "Experience" })).toHaveAttribute(
      "href",
      "/experience",
    );
    expect(screen.getByRole("link", { name: "Tech Stack" })).toHaveAttribute(
      "href",
      "/tech-stack",
    );
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact",
    );

    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Download Resume" })).toHaveAttribute(
      "href",
      resumePath,
    );
  });

  it("keeps the active state when GitHub Pages serves a trailing slash path", () => {
    usePathnameMock.mockReturnValue("/tech-stack/");

    render(<Header />);

    expect(screen.getByRole("link", { name: "Tech Stack" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("keeps the active state when GitHub Pages includes the repository base path", () => {
    usePathnameMock.mockReturnValue("/nikhil-sai-nethi-portfolio/experience/");

    render(<Header />);

    expect(screen.getByRole("link", { name: "Experience" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
