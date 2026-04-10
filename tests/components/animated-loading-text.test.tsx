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

  it("can switch to a dark-surface-safe shimmer tone for light buttons", () => {
    render(
      <AnimatedLoadingText tone="dark" className="inline-flex text-sm">
        作成中...
      </AnimatedLoadingText>,
    );

    const text = screen.getByText("作成中...");

    expect(text.className).toContain(
      "motion-safe:bg-[linear-gradient(90deg,#3f3310_0%,#f6c453_50%,#3f3310_100%)]",
    );
    expect(text.className).not.toContain(
      "motion-safe:bg-[linear-gradient(90deg,#f8f5f0_0%,#f6c453_50%,#f8f5f0_100%)]",
    );
  });
});
