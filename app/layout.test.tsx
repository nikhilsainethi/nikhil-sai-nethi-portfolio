import { vi } from "vitest";
import { siteUrl } from "@/lib/site";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

import { metadata } from "./layout";

describe("layout metadata", () => {
  it("publishes canonical Open Graph and Twitter metadata for GitHub Pages", () => {
    expect(metadata.metadataBase?.toString()).toBe(siteUrl);
    expect(metadata.alternates?.canonical).toBe("/");
    expect(metadata.openGraph).toMatchObject({
      title: "Nikhil Sai Nethi | Software Engineer",
      description:
        "Portfolio for Nikhil Sai Nethi, a software engineer focused on cloud infrastructure, observability, and AI/LLM applications.",
      url: "/",
      images: ["/opengraph-image"],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Nikhil Sai Nethi | Software Engineer",
      description:
        "Portfolio for Nikhil Sai Nethi, a software engineer focused on cloud infrastructure, observability, and AI/LLM applications.",
      images: ["/twitter-image"],
    });
  });
});
