"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, customerMessage } from "@/lib/teksum-api";

export default function MfaPage() {
  const [challenge, setChallenge] = useState("");
  const [redirect, setRedirect] = useState("/dashboard");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setChallenge(sessionStorage.getItem("teksum_mfa_challenge") || "");
    setRedirect(sessionStorage.getItem("teksum_mfa_redirect") || "/dashboard");
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!challenge) {
      setError("This sign-in challenge is missing or expired. Start again.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit authenticator code.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiFetch<{ message?: string }>(
        "/auth/mfa/verify",
        {
          method: "POST",
          body: JSON.stringify({ challengeToken: challenge, code }),
        },
        { auth: false },
      );
      sessionStorage.removeItem("teksum_mfa_challenge");
      sessionStorage.removeItem("teksum_mfa_redirect");
      const safe =
        redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : "/dashboard";
      window.location.href = safe;
    } catch (e) {
      setError(customerMessage(e, "We couldn't verify that code. Try again."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="grid min-h-svh min-w-0 lg:grid-cols-2">
      <div className="hidden min-w-0 bg-zinc-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="font-black">
          TEKSUM
        </Link>
        <div className="max-w-md">
          <ShieldCheck className="size-10 text-emerald-400" />
          <h1 className="mt-5 text-4xl font-black">One more security check.</h1>
          <p className="mt-4 text-white/55">
            Enter the current code from your authenticator app to finish signing
            in.
          </p>
        </div>
        <p className="text-xs text-white/35">TEKSUM • Secure access</p>
      </div>
      <div className="flex min-w-0 items-center justify-center p-4 sm:p-6">
        <div className="w-full min-w-0 max-w-sm">
          <Link
            href="/"
            className="mb-10 flex items-center justify-center font-black lg:hidden"
          >
            TEKSUM
          </Link>
          <div className="w-full min-w-0 rounded-3xl border bg-card p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">
              MFA
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">
              Verify your sign-in
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use the 6-digit code from your authenticator app.
            </p>
            <form onSubmit={submit} className="mt-7 space-y-4">
              <Input
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="h-14 w-full min-w-0 text-center font-mono text-2xl tracking-[.2em] sm:tracking-[.35em]"
              />
              {error && (
                <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={busy || code.length !== 6}
                size="lg"
                className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {busy ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Verify & continue"
                )}
              </Button>
            </form>
            {!challenge && (
              <p className="mt-5 text-center text-xs text-muted-foreground">
                Start again from{" "}
                <Link href="/sign-in" className="text-emerald-600">
                  Sign in
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
