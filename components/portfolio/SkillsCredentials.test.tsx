import { render, screen } from "@testing-library/react";
import { CertificationsEducation } from "./CertificationsEducation";
import { Skills } from "./Skills";

describe("Skills", () => {
  it("shows the fuller grouped skill inventory from the resume", () => {
    render(<Skills />);

    expect(screen.getByText("Languages")).toBeInTheDocument();
    expect(screen.getByText("Cloud / Platform")).toBeInTheDocument();
    expect(screen.getByText("Observability / Networking")).toBeInTheDocument();
    expect(screen.getByText("Messaging / Data")).toBeInTheDocument();
    expect(screen.getByText("AI / LLM")).toBeInTheDocument();

    expect(screen.getByText("Datadog")).toBeInTheDocument();
    expect(screen.getByText("Kafka")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL/pgvector")).toBeInTheDocument();
    expect(screen.getByText("CI/CD")).toBeInTheDocument();
  });
});

describe("CertificationsEducation", () => {
  it("renders credential dates and full education details neatly", () => {
    render(<CertificationsEducation />);

    expect(screen.getByText("CKA · Jun 2024")).toBeInTheDocument();
    expect(screen.getByText("AWS · Mar 2024")).toBeInTheDocument();
    expect(screen.getByText("CCNA · Dec 2025")).toBeInTheDocument();

    expect(
      screen.getByText("California State University East Bay"),
    ).toBeInTheDocument();
    expect(screen.getByText("Hayward, California, USA")).toBeInTheDocument();
    expect(screen.getByText("Jan 2022 - Dec 2023")).toBeInTheDocument();

    expect(screen.getByText("Vellore Institute of Technology")).toBeInTheDocument();
    expect(screen.getByText("Vellore, India")).toBeInTheDocument();
    expect(screen.getByText("2016 - 2021")).toBeInTheDocument();
  });
});
