import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnimatedLoadingText } from "../../components/animated-loading-text";

describe("AnimatedLoadingText", () => {
  it("renders text with shimmer hooks and no inline style tag", () => {
    const { container } = render(
      <AnimatedLoadingText className="inline-flex text-sm">ログイン中...</AnimatedLoadingText>,
    );

    const text = screen.getByText("ログイン中...");

    expect(text).toBeInTheDocument();
    expect(text.className).toContain("motion-safe:");
    expect(text.className).toContain("motion-reduce:");
    expect(text.className).toContain("inline-flex");
    expect(container.querySelector("style")).toBeNull();
  });
});
