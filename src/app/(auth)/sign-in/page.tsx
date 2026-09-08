"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, customerMessage, isRateLimitedError } from "@/lib/teksum-api";
import { BrandMark } from "@/components/brand-mark";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await apiFetch<{
        mfaRequired?: boolean;
        challengeToken?: string;
      }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) },
        { auth: false },
      );
      const next = new URLSearchParams(window.location.search).get("redirect");
      const safeNext =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/dashboard";
      if (r.mfaRequired && r.challengeToken) {
        sessionStorage.setItem("teksum_mfa_challenge", r.challengeToken);
        sessionStorage.setItem("teksum_mfa_redirect", safeNext);
        window.location.href = "/mfa";
        return;
      }
      sessionStorage.removeItem("teksum-auth-redirecting");
      window.location.href = safeNext;
    } catch (e) {
      setError(
        isRateLimitedError(e)
          ? "Too many sign-in attempts. Please wait a little before trying again."
          : customerMessage(
              e,
              "We couldn't sign you in. Check your details and try again.",
            ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="grid min-h-svh min-w-0 lg:grid-cols-2 teksum-motion-surface">
      <div className="hidden min-w-0 bg-zinc-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark />
          <span className="font-black">TEKSUM</span>
        </Link>
        <div className="max-w-md">
          <ShieldCheck className="size-10 text-emerald-400" />
          <h2 className="mt-5 text-4xl font-black tracking-tight">
            Your TEKSUM wallet, protected.
          </h2>
          <p className="mt-4 text-white/55">
            Secure authentication, transaction PINs and a clear transaction
            trail for every purchase.
          </p>
        </div>
        <p className="text-xs text-white/35">
          TEKSUM • Nigerian digital services
        </p>
      </div>
      <div className="flex min-w-0 items-center justify-center p-4 sm:p-6">
        <div className="w-full min-w-0 max-w-sm">
          <Link
            href="/"
            className="mb-10 flex items-center justify-center gap-2 lg:hidden"
          >
            <BrandMark />
            <span className="font-black">TEKSUM</span>
          </Link>
          <h1 className="text-3xl font-black tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage your wallet and digital services.
          </p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <div className="mb-2 flex justify-between">
                <label className="text-sm font-medium">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-emerald-600"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-2.5 text-muted-foreground"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={busy}
              size="lg"
              className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {busy ? <Loader2 className="animate-spin" /> : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to TEKSUM?{" "}
            <Link href="/sign-up" className="font-semibold text-emerald-600">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
