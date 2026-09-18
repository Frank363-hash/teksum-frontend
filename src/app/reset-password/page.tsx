"use client";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8)
      return setMessage("Password must be at least 8 characters.");
    if (password.length > 128)
      return setMessage("Password must be 128 characters or fewer.");
    if (!/[a-z]/.test(password))
      return setMessage("Password must contain at least one lowercase letter.");
    if (!/[A-Z]/.test(password))
      return setMessage("Password must contain at least one uppercase letter.");
    if (!/\d/.test(password))
      return setMessage("Password must contain at least one number.");
    if (!/[^A-Za-z0-9]/.test(password))
      return setMessage("Password must contain at least one symbol.");
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
      <div className="relative">
        <Input type={showPassword ? "text" : "password"} minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" required className="pr-10" aria-label="New password" />
        <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground" aria-label={showPassword ? "Hide new password" : "Show new password"} title={showPassword ? "Hide password" : "Show password"}>
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <div className="relative">
        <Input type={showConfirm ? "text" : "password"} minLength={8} maxLength={128} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" required className="pr-10" aria-label="Confirm new password" />
        <button type="button" onClick={() => setShowConfirm((value) => !value)} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground" aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"} title={showConfirm ? "Hide password" : "Show password"}>
          {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <p className="rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs leading-5 text-white/50">
        Use 8–128 characters with at least one lowercase letter, one uppercase letter, one number, and one symbol.
      </p>
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
