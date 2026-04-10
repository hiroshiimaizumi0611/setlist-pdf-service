import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnimatedLoadingText } from "../../components/animated-loading-text";

describe("AnimatedLoadingText", () => {
  it("renders text with the shared shimmer animation token and no inline style tag", () => {
    const { container } = render(
      <AnimatedLoadingText className="inline-flex text-sm">ログイン中...</AnimatedLoadingText>,
    );

    const text = screen.getByText("ログイン中...");

    expect(text).toBeInTheDocument();
    expect(text.className).toContain(
      "motion-safe:[animation:animated-loading-text-shimmer_1.8s_linear_infinite]",
    );
    expect(text.className).toContain("motion-reduce:[animation:none]");
    expect(text.className).toContain("inline-flex");
    expect(container.querySelector("style")).toBeNull();
  });
});
