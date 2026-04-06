import { render, screen } from "@testing-library/react";
import ContactPage from "./page";

describe("Contact page", () => {
  it("renders the dedicated contact destinations", () => {
    render(<ContactPage />);

    expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "nikhilsainethi@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:nikhilsainethi@gmail.com",
    );
    expect(screen.getByRole("link", { name: "github.com/nikhilsainethi" })).toHaveAttribute(
      "href",
      "https://github.com/nikhilsainethi",
    );
  });
});
