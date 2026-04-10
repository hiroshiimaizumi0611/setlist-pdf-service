"use client";

import { useFormStatus } from "react-dom";
import { AnimatedLoadingText, type AnimatedLoadingTextTone } from "./animated-loading-text";

type FormPendingButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  className: string;
  tone?: AnimatedLoadingTextTone;
};

export function FormPendingButton({
  idleLabel,
  pendingLabel,
  className,
  tone = "light",
}: FormPendingButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending} disabled={pending} className={className}>
      {pending ? <AnimatedLoadingText tone={tone}>{pendingLabel}</AnimatedLoadingText> : idleLabel}
    </button>
  );
}
