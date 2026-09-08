"use client";
import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, customerMessage } from "@/lib/teksum-api";
function VerifyForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const redirect = params.get("redirect");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      await apiFetch(
        "/auth/verify-email",
        { method: "POST", body: JSON.stringify({ email, code }) },
        { auth: false },
      );
      setMessage("Email verified successfully. You can now sign in.");
    } catch (e) {
      setMessage(
        customerMessage(e, "We couldn't verify that code. Try again."),
      );
    }
  }
  return (
    <>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <Input
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          required
        />
        {message && (
          <p className="rounded-xl bg-white/5 p-3 text-sm text-white/65">
            {message}
          </p>
        )}
        <Button type="submit" className="w-full bg-emerald-500 text-black">
          Verify email
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-white/45">
        Need another code?{" "}
        <button
          type="button"
          className="text-emerald-300"
          onClick={async () => {
            try {
              await apiFetch(
                "/auth/resend-verification",
                { method: "POST", body: JSON.stringify({ email }) },
                { auth: false },
              );
              setMessage("If eligible, a new code has been sent.");
            } catch (e) {
              setMessage(
                customerMessage(e, "We couldn't resend the code right now."),
              );
            }
          }}
        >
          Resend
        </button>
      </p>
      {redirect && (
        <p className="mt-3 text-center text-xs text-white/35">
          After verification, sign in and TEKSUM will return you to your
          original task.
        </p>
      )}
    </>
  );
}
export default function VerifyEmail() {
  return (
    <main className="min-h-svh min-w-0 overflow-x-clip bg-zinc-950 px-4 py-8 text-white sm:px-5 sm:py-10">
      <div className="mx-auto min-w-0 max-w-md">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark />
          <span className="font-black">TEKSUM</span>
        </Link>
        <div className="mt-16 rounded-3xl border border-white/10 bg-white/[.05] p-7">
          <h1 className="text-3xl font-black">Verify your email</h1>
          <p className="mt-2 text-sm text-white/50">
            Enter the 6-digit code sent to your email.
          </p>
          <Suspense
            fallback={<p className="mt-6 text-sm text-white/50">Loading…</p>}
          >
            <VerifyForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
