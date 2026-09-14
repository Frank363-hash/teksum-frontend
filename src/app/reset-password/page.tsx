"use client";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, customerMessage } from "@/lib/teksum-api";
function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState(params.get("email") || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 12)
      return setMessage("Password must be at least 12 characters.");
    if (password !== confirm) return setMessage("Passwords do not match.");
    try {
      await apiFetch(
        "/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({ email, otp, newPassword: password }),
        },
        { auth: false },
      );
      setMessage("Password reset successfully.");
      setTimeout(() => router.push("/sign-in"), 900);
    } catch (e) {
      setMessage(customerMessage(e, "We could not reset your password right now. Please check the code and try again."));
    }
  }
  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <Input
        inputMode="numeric"
        maxLength={6}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        placeholder="6-digit code"
        required
      />
      <Input
        type="password"
        minLength={12}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        required
      />
      <Input
        type="password"
        minLength={12}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirm new password"
        required
      />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      <Button type="submit" className="w-full bg-emerald-500 text-black">
        Reset password
      </Button>
    </form>
  );
}
export default function ResetPassword() {
  return (
    <main className="min-h-svh min-w-0 overflow-x-clip bg-zinc-950 px-4 py-8 text-white sm:px-5 sm:py-10">
      <div className="mx-auto min-w-0 max-w-md">
        <Link href="/sign-in" className="flex items-center gap-2">
          <BrandMark />
          <span className="font-black">TEKSUM</span>
        </Link>
        <div className="mt-16 rounded-3xl border border-white/10 bg-white/[.05] p-7">
          <h1 className="text-3xl font-black">Choose a new password</h1>
          <Suspense
            fallback={<p className="mt-6 text-sm text-white/50">Loading…</p>}
          >
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
