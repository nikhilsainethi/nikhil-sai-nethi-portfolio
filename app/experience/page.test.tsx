import { render, screen } from "@testing-library/react";
import ExperiencePage from "./page";

describe("Experience page", () => {
  it("renders the experience timeline along with certifications and education", () => {
    render(<ExperiencePage />);

    expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Moody's Corporation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Verisk Analytics" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Nokia Solutions & Networks" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Certifications & Education" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Certified Kubernetes Administrator")).toBeInTheDocument();
    expect(screen.getByText("California State University East Bay")).toBeInTheDocument();
  });
});
