import { render, screen, within } from "@testing-library/react";
import { withBasePath } from "@/lib/site";
import { ExperienceTimeline } from "./ExperienceTimeline";

describe("ExperienceTimeline", () => {
  it("renders the three experience entries in order with Moody's keywords", () => {
    render(<ExperienceTimeline />);

    const companies = screen
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);

    expect(companies).toEqual([
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

  it("includes the broader resume bullet coverage across Moody's and Nokia", () => {
    render(<ExperienceTimeline />);

    expect(
      screen.getByText(/Supported on-call for production services on Linux and Amazon EKS/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Automated release safety and operational workflows using Python, Bash, Jenkins, and Git/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Troubleshot DNS, TLS, HTTP routing, L4\/L7 load balancers, and firewall path issues/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Debugged and resolved 150\+ Layer 2\/3 networking bugs/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Documented and tracked 100\+ defects in Jira/i),
    ).toBeInTheDocument();
  });

  it("renders checked-in local company logos instead of remote logo services", () => {
    render(<ExperienceTimeline />);

    expect(screen.getByAltText("Moody's Corporation logo")).toHaveAttribute(
      "src",
      withBasePath("/logos/moodys-wordmark.svg"),
    );
    expect(screen.getByAltText("Verisk Analytics logo")).toHaveAttribute(
      "src",
      withBasePath("/logos/verisk-wordmark.svg"),
    );
    expect(
      screen.getByAltText("Nokia Solutions & Networks logo"),
    ).toHaveAttribute("src", withBasePath("/logos/nokia-brand.svg"));
  });
});
