import { describe, expect, it } from "vitest";
import { basePath, repoName, siteUrl } from "./site";

describe("site metadata", () => {
  it("defines the GitHub Pages repository path and absolute site URL", () => {
    expect(repoName).toBe("nikhil-sai-nethi-portfolio");
    expect(basePath).toBe("/nikhil-sai-nethi-portfolio");
    expect(siteUrl).toBe(
      "https://nikhilsainethi.github.io/nikhil-sai-nethi-portfolio/",
    );
    expect(basePath.startsWith("/")).toBe(true);
    expect(siteUrl.endsWith("/")).toBe(true);
  });
});
