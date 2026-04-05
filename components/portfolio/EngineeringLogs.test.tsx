import { render, screen } from "@testing-library/react";
import { EngineeringLogs } from "./EngineeringLogs";

describe("EngineeringLogs", () => {
  it("renders updates in descending date order with reference links", () => {
    render(<EngineeringLogs />);

    const titles = screen
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);

    expect(titles).toEqual([
      "Designed and shipped internal RAG search engine",
      "Earned CKA Certification",
      "AWS Developer Associate Certification",
    ]);

    expect(screen.getByText("2026-04-01")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Open reference" })).toHaveLength(3);
  });
});
