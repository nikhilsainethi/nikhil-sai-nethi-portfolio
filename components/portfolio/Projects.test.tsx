import { render, screen } from "@testing-library/react";
import { Projects } from "./Projects";

describe("Projects", () => {
  it("shows a cleaner editorial layout instead of the old architecture diagram", () => {
    render(<Projects />);

    expect(screen.getByText("System Highlights")).toBeInTheDocument();
    expect(screen.queryByText("Lambda (Chunking)")).not.toBeInTheDocument();
    expect(screen.queryByText("User Query")).not.toBeInTheDocument();
  });
});
