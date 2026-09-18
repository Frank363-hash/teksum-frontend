"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Eye, EyeOff, Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, customerMessage } from "@/lib/teksum-api";

export function SignUpPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const redirect = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  ).get("redirect");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (password.length > 128)
      return setError("Password must be 128 characters or fewer.");
    if (!/[a-z]/.test(password))
      return setError("Password must contain at least one lowercase letter.");
    if (!/[A-Z]/.test(password))
      return setError("Password must contain at least one uppercase letter.");
    if (!/\d/.test(password))
      return setError("Password must contain at least one number.");
    if (!/[^A-Za-z0-9]/.test(password))
      return setError("Password must contain at least one symbol.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    setError("");
    try {
      await apiFetch(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({ fullName: name, phone, email, password }),
        },
        { auth: false },
      );
      setDone(true);
    } catch (e) {
      setError(customerMessage(e, "We could not create your account right now. Please check your details and try again."));
    } finally {
      setBusy(false);
    }
  }
  const verifyHref = `/verify-email?email=${encodeURIComponent(email)}${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ""}`;
  const signInHref = `/sign-in${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`;
  return (
    <main className="min-h-svh min-w-0 overflow-x-clip bg-background px-4 py-8 text-foreground teksum-motion-surface sm:px-5 sm:py-10">
      <div className="mx-auto min-w-0 max-w-5xl">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark />
          <span className="font-black">TEKSUM</span>
        </Link>
        <div className="mx-auto mt-10 w-full min-w-0 max-w-md rounded-3xl border bg-card p-5 shadow-2xl sm:mt-12 sm:p-7">
          <UserRound className="size-9 text-emerald-500" />
          <h1 className="mt-5 break-words text-3xl font-black">
            Create your TEKSUM account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set up your account to use TEKSUM services.
          </p>
          {done ? (
            <div className="mt-7 space-y-4">
              <div className="rounded-2xl bg-emerald-500/10 p-5 text-sm text-emerald-700 dark:text-emerald-300">
                Account created. Check your email to continue.
              </div>
              <Button
                className="w-full rounded-xl bg-emerald-500 text-black hover:bg-emerald-400"
                render={<Link href={verifyHref} />}
              >
                Verify email
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-7 space-y-4">
              <div>
                <label className="mb-2 block text-sm">Full name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm">Phone number</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    maxLength={128}
                    required
                    className="pr-10"
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm">Confirm password</label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    minLength={8}
                    maxLength={128}
                    required
                    className="pr-10"
                    aria-label="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((value) => !value)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}
                    title={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <p className="rounded-xl border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
                Use 8–128 characters with at least one lowercase letter, one uppercase letter, one number, and one symbol.
              </p>
              {error && (
                <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}
              <p className="rounded-xl border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
                By creating an account, you agree to the <Link href="/terms" className="font-semibold text-foreground underline underline-offset-2">Terms & Conditions</Link> and acknowledge the <Link href="/privacy" className="font-semibold text-foreground underline underline-offset-2">Privacy Policy</Link>. Wallet and funding arrangements are governed by the <Link href="/wallet-terms" className="font-semibold text-foreground underline underline-offset-2">Wallet & Funding Terms</Link>.
              </p>
              {/* Agreement version/timestamp capture is intentionally not simulated here; the backend will own the legal record when that contract is added. */}
              <Button
                type="submit"
                disabled={busy}
                size="lg"
                className="w-full rounded-xl bg-emerald-500 text-black hover:bg-emerald-400"
              >
                {busy ? <Loader2 className="animate-spin" /> : "Create account"}
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={signInHref} className="font-semibold text-emerald-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
