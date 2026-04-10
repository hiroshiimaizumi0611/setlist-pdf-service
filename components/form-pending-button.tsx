"use client";

import { useFormStatus } from "react-dom";
import { AnimatedLoadingText } from "./animated-loading-text";

type FormPendingButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  className: string;
};

export function FormPendingButton({
  idleLabel,
  pendingLabel,
  className,
}: FormPendingButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending} disabled={pending} className={className}>
      {pending ? <AnimatedLoadingText>{pendingLabel}</AnimatedLoadingText> : idleLabel}
    </button>
  );
}
