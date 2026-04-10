type AnimatedLoadingTextProps = {
  children: string;
  className?: string;
};

const shimmerClassName =
  "motion-safe:bg-[linear-gradient(90deg,#f8f5f0_0%,#f6c453_50%,#f8f5f0_100%)] motion-safe:bg-[length:200%_100%] motion-safe:bg-clip-text motion-safe:text-transparent motion-safe:[animation:animated-loading-text-shimmer_1.8s_linear_infinite] motion-reduce:bg-none motion-reduce:text-current motion-reduce:[animation:none]";

export function AnimatedLoadingText({ children, className = "" }: AnimatedLoadingTextProps) {
  return <span className={`${shimmerClassName} ${className}`.trim()}>{children}</span>;
}
