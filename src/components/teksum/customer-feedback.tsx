"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, Loader2, XCircle } from "lucide-react";

export type CustomerFeedbackVariant = "error" | "success" | "info";

type CustomerFeedbackProps = {
  message?: string;
  loading?: boolean;
  loadingTitle?: string;
  loadingMessage?: string;
  variant?: CustomerFeedbackVariant;
  action?: ReactNode;
};

function inferVariant(message: string): CustomerFeedbackVariant {
  if (/successfully|has been sent|enabled\.|disabled\.|updated successfully|verified\./i.test(message)) {
    return "success";
  }
  return "error";
}

export function CustomerFeedback({
  message,
  loading = false,
  loadingTitle = "Processing…",
  loadingMessage = "Please wait and do not close or refresh this page.",
  variant,
  action,
}: CustomerFeedbackProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visible = loading || Boolean(message);
  const activeVariant = loading ? "info" : variant ?? (message ? inferVariant(message) : "info");

  if (!mounted || !visible) {
    return null;
  }

  return createPortal(
    <div
      aria-live={activeVariant === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      className={
        visible
          ? "pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-5"
          : "pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 opacity-0 sm:top-5"
      }
      data-teksum-customer-feedback="true"
    >
      <div
        className={`pointer-events-auto w-full max-w-lg rounded-2xl border p-4 text-sm shadow-2xl backdrop-blur-md ${
          activeVariant === "error"
            ? "border-destructive/30 bg-background/95 text-destructive"
            : activeVariant === "success"
              ? "border-emerald-500/30 bg-background/95 text-foreground"
              : "border-amber-500/30 bg-background/95 text-foreground"
        }`}
      >
        <div className="flex items-start gap-3">
          {loading ? (
            <Loader2
              className="mt-0.5 size-5 shrink-0 animate-spin text-amber-500"
              aria-hidden="true"
            />
          ) : activeVariant === "success" ? (
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-emerald-500"
              aria-hidden="true"
            />
          ) : activeVariant === "error" ? (
            <XCircle
              className="mt-0.5 size-5 shrink-0 text-destructive"
              aria-hidden="true"
            />
          ) : (
            <Info
              className="mt-0.5 size-5 shrink-0 text-amber-500"
              aria-hidden="true"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              {loading
                ? loadingTitle
                : activeVariant === "success"
                  ? "Done"
                  : activeVariant === "info"
                    ? "Please note"
                    : "Please check this"}
            </p>
            <p
              className={
                activeVariant === "error"
                  ? "mt-1 text-destructive/90"
                  : "mt-1 text-muted-foreground"
              }
            >
              {loading ? loadingMessage : message}
            </p>
            {action && <div className="mt-3">{action}</div>}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
