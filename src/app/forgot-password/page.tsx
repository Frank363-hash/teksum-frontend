"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, customerMessage } from "@/lib/teksum-api";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await apiFetch(
        "/auth/forgot-password",
        { method: "POST", body: JSON.stringify({ email }) },
        { auth: false },
      );
      setDone(true);
    } catch (e) {
      setError(
        customerMessage(e, "We could not request a reset code right now. Please try again shortly."),
      );
    }
  }
  return (
    <main className="min-h-svh min-w-0 overflow-x-clip bg-zinc-950 px-4 py-8 text-white sm:px-5 sm:py-10">
      <div className="mx-auto min-w-0 max-w-md">
        <Link href="/sign-in" className="font-black">
          TEKSUM
        </Link>
        <div className="mt-16 rounded-3xl border border-white/10 bg-white/[.05] p-7">
          <h1 className="text-3xl font-black">Reset your password</h1>
          <p className="mt-2 text-sm text-white/50">
            We will send a verification code to the email on your account.
          </p>
          {done ? (
            <div className="mt-6 space-y-4">
              <p className="rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-200">
                If the account is eligible, a reset code has been sent.
              </p>
              <Button
                className="w-full bg-emerald-500 text-black"
                render={
                  <Link
                    href={`/reset-password?email=${encodeURIComponent(email)}`}
                  />
                }
              >
                Continue to reset
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 text-black"
              >
                Send reset code
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
