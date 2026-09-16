"use client"

import Link from "next/link"
import { ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { customerMessage, requestPinReset, resetPin } from "@/lib/teksum-api"

export default function ResetTransactionPinPage() {
  const [busy, setBusy] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [resetCode, setResetCode] = useState("")
  const [newPin, setNewPin] = useState("")
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  async function sendResetCode() {
    setBusy(true)
    setMessage("")
    setSuccess(false)
    try {
      await requestPinReset()
      setCodeSent(true)
      setMessage("A reset code has been sent to your account email.")
    } catch (error) {
      setMessage(customerMessage(error, "We couldn't send a reset code right now."))
    } finally {
      setBusy(false)
    }
  }

  async function completeReset() {
    if (resetCode.length !== 6 || newPin.length !== 4) return
    setBusy(true)
    setMessage("")
    setSuccess(false)
    try {
      await resetPin(resetCode, newPin)
      setSuccess(true)
      setMessage("Your transaction PIN has been reset successfully.")
      setResetCode("")
      setNewPin("")
    } catch (error) {
      setMessage(customerMessage(error, "We couldn't reset your transaction PIN. Check the code and try again."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard/settings?tab=security" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Back to Security settings
        </Link>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-emerald-500">Security</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Reset your transaction PIN</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Forgot your PIN? Send a reset code to your account email, then use that code to choose a new 4-digit PIN.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="size-5 text-emerald-500" /> Reset PIN</CardTitle>
          <CardDescription>Your existing transaction PIN will be replaced after the reset is completed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {!codeSent ? (
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-sm font-semibold">Send a reset code</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">We'll email a 6-digit code to the email address on your TEKSUM account.</p>
              <Button type="button" className="mt-4" disabled={busy} onClick={sendResetCode}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                {busy ? "Sending code…" : "Email me a reset code"}
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[.04] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="size-4 text-emerald-500" /> Reset code sent</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Check your account email and enter the 6-digit code below.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Reset code</label>
                <Input inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={resetCode} onChange={e => setResetCode(e.target.value.replace(/\D/g, ""))} placeholder="6-digit reset code" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">New transaction PIN</label>
                <Input inputMode="numeric" maxLength={4} type="password" autoComplete="new-password" value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ""))} placeholder="New 4-digit PIN" />
              </div>
              <Button type="button" disabled={busy || resetCode.length !== 6 || newPin.length !== 4} onClick={completeReset}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                {busy ? "Resetting PIN…" : "Reset transaction PIN"}
              </Button>
              <button type="button" disabled={busy} onClick={sendResetCode} className="ml-3 text-sm font-semibold text-emerald-500 hover:underline disabled:opacity-50">
                Send a new code
              </button>
            </>
          )}

          {message && <p className={`text-sm ${success ? "text-emerald-500" : "text-muted-foreground"}`}>{message}</p>}

          {success && (
            <Button variant="outline" render={<Link href="/dashboard/settings?tab=security" />}>
              Return to Security settings
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
