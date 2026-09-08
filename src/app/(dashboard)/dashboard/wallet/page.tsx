"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  customerMessage,
  formatNaira,
  getWallet,
  getFundingAccount,
  recordDvaConsent,
  getWithdrawalBanks,
  initializeFunding,
  verifyFunding,
  verifyWithdrawalAccount,
  quoteWithdrawal,
  withdrawFunds,
  type WithdrawalBank,
  type FundingAccount,
  type WithdrawalQuote,
  getOrCreateActionIdempotencyKey,
  clearActionIdempotencyKey,
} from "@/lib/teksum-api";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const params = useSearchParams();
  const [balance, setBalance] = useState("0");
  const [fundAmount, setFundAmount] = useState(5000);
  const [fundLoading, setFundLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [fundMessage, setFundMessage] = useState("");
  const [fundingAccount, setFundingAccount] = useState<FundingAccount | null>(null);
  const [fundingAccountLoading, setFundingAccountLoading] = useState(false);
  const [fundingAccountMessage, setFundingAccountMessage] = useState("");
  const [dvaConsent, setDvaConsent] = useState(false);

  const [banks, setBanks] = useState<WithdrawalBank[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState("");
  const [withdrawPin, setWithdrawPin] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState("");
  const [withdrawQuote, setWithdrawQuote] = useState<WithdrawalQuote | null>(null);
  const [withdrawQuoteLoading, setWithdrawQuoteLoading] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState<"details" | "review" | "pin" | "result">("details");
  const [withdrawResult, setWithdrawResult] = useState<{
    status: string;
    reference: string;
    amount: string;
    fee: string;
  } | null>(null);

  async function refreshWallet() {
    try {
      const wallet = await getWallet();
      setBalance(wallet.balance);
    } catch {
      // The dashboard session guard handles authentication failures.
    }
  }

  useEffect(() => {
    void refreshWallet();
    getWithdrawalBanks()
      .then(setBanks)
      .catch(() => setBanks([]));
  }, []);

  useEffect(() => {
    const reference = params.get("reference");
    if (!reference) return;

    setChecking(true);
    setFundMessage("Checking your payment…");
    verifyFunding(reference)
      .then(async (result) => {
        setFundMessage(
          result.status === "SUCCESS"
            ? "Wallet funded successfully."
            : result.status === "PENDING"
              ? "Your funding is still being confirmed. Check Transactions for the latest status."
              : "The payment could not be confirmed yet.",
        );
        await refreshWallet();
      })
      .catch((error) =>
        setFundMessage(
          customerMessage(
            error,
            "We couldn't confirm that payment yet. Check Transactions for the latest status.",
          ),
        ),
      )
      .finally(() => setChecking(false));
  }, [params]);

  async function requestFundingAccount() {
    if (!dvaConsent) {
      setFundingAccountMessage("Please read the Wallet & Funding Terms and Privacy Policy and give your express consent before continuing.");
      return;
    }

    setFundingAccountLoading(true);
    setFundingAccountMessage("");
    try {
      await recordDvaConsent();
      const account = await getFundingAccount();
      setFundingAccount(account);
    } catch (error) {
      setFundingAccount(null);
      setFundingAccountMessage(
        customerMessage(error, "Your permanent funding account is not available yet. Please try again shortly."),
      );
    } finally {
      setFundingAccountLoading(false);
    }
  }

  async function fund(event: React.FormEvent) {
    event.preventDefault();
    if (!Number.isFinite(fundAmount) || fundAmount < 100) return;

    setFundLoading(true);
    setFundMessage("");
    setCheckoutUrl("");
    try {
      const result = await initializeFunding(fundAmount, getOrCreateActionIdempotencyKey("funding"));
      clearActionIdempotencyKey("funding");
      if (result.checkoutUrl) {
        setCheckoutUrl(result.checkoutUrl);
        setFundMessage(
          "Your secure checkout is ready. Complete payment, then return to TEKSUM for verification.",
        );
      } else {
        setFundMessage(
          "Funding was initialized. Check Transactions for the latest status.",
        );
      }
    } catch (error) {
      setFundMessage(
        customerMessage(
          error,
          "We couldn't initialize wallet funding right now. Please try again shortly.",
        ),
      );
    } finally {
      setFundLoading(false);
    }
  }

  async function verifyAccount() {
    if (!/^\d{10}$/.test(accountNumber) || !/^\d{3}$/.test(bankCode)) {
      setWithdrawMessage(
        "Select a bank and enter a valid 10-digit account number.",
      );
      return;
    }

    setVerifyingAccount(true);
    setWithdrawMessage("");
    setAccountName("");
    try {
      const result = await verifyWithdrawalAccount(accountNumber, bankCode);
      setAccountName(result.accountName);
      setWithdrawMessage(
        "Bank account verified. Review the name before continuing.",
      );
    } catch (error) {
      setWithdrawMessage(
        customerMessage(
          error,
          "We couldn't verify that bank account right now.",
        ),
      );
    } finally {
      setVerifyingAccount(false);
    }
  }

  function withdrawalReasonMessage(reasons: string[], quote: WithdrawalQuote) {
    if (reasons.includes("INSUFFICIENT_FUNDS")) {
      const shortfall = Math.max(0, Number(quote.amount) - Number(quote.walletBalance));
      return `Your wallet balance is not enough for this withdrawal. You need ${formatNaira(shortfall)} more.`;
    }
    if (reasons.includes("MIN_WITHDRAWAL")) {
      return `The minimum withdrawal is ${formatNaira(quote.minimumWithdrawal)}.`;
    }
    if (reasons.includes("MAX_WITHDRAWAL") && quote.maximumWithdrawal) {
      return `The maximum single withdrawal is ${formatNaira(quote.maximumWithdrawal)}.`;
    }
    if (reasons.includes("DAILY_LIMIT")) {
      return `Your remaining daily withdrawal limit is ${formatNaira(quote.dailyRemaining)}.`;
    }
    if (reasons.includes("INVALID_PAYOUT")) {
      return "The amount is too small after the withdrawal fee.";
    }
    if (reasons.includes("INVALID_AMOUNT")) {
      return "Enter a valid withdrawal amount.";
    }
    return "Check the withdrawal details and try again.";
  }

  async function refreshWithdrawalQuote(amountText: string) {
    const amount = Number(amountText);
    if (!Number.isFinite(amount) || amount <= 0) {
      setWithdrawQuote(null);
      return null;
    }

    setWithdrawQuoteLoading(true);
    try {
      const result = await quoteWithdrawal(amount);
      setWithdrawQuote(result);
      return result;
    } catch (error) {
      setWithdrawQuote(null);
      setWithdrawMessage(
        customerMessage(error, "We couldn't check this withdrawal amount right now."),
      );
      return null;
    } finally {
      setWithdrawQuoteLoading(false);
    }
  }

  useEffect(() => {
    const amount = Number(withdrawAmountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setWithdrawQuote(null);
      return;
    }

    const timer = window.setTimeout(() => {
      void refreshWithdrawalQuote(withdrawAmountInput);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [withdrawAmountInput]);

  async function continueToReview() {
    if (!accountName) {
      setWithdrawMessage("Verify the bank account before continuing.");
      return;
    }

    const amount = Number(withdrawAmountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setWithdrawMessage("Enter a valid withdrawal amount.");
      return;
    }

    setWithdrawMessage("");
    const latestQuote = await refreshWithdrawalQuote(withdrawAmountInput);
    if (!latestQuote) return;

    if (!latestQuote.canWithdraw) {
      setWithdrawMessage(withdrawalReasonMessage(latestQuote.reasons, latestQuote));
      return;
    }

    setWithdrawStep("review");
  }

  function resetWithdrawal() {
    setBankCode("");
    setAccountNumber("");
    setAccountName("");
    setWithdrawAmountInput("");
    setWithdrawPin("");
    setWithdrawQuote(null);
    setWithdrawMessage("");
    setWithdrawResult(null);
    setWithdrawStep("details");
  }

  async function withdraw(event: React.FormEvent) {
    event.preventDefault();
    if (!accountName) {
      setWithdrawMessage("Verify the bank account before withdrawing.");
      return;
    }
    const amount = Number(withdrawAmountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setWithdrawMessage("Enter a valid withdrawal amount.");
      return;
    }
    if (!/^\d{4}$/.test(withdrawPin)) {
      setWithdrawMessage("Enter your 4-digit transaction PIN.");
      return;
    }

    setWithdrawLoading(true);
    setWithdrawMessage("");
    try {
      const result = await withdrawFunds({
        bankCode,
        accountNumber,
        accountName,
        amount,
        txnPin: withdrawPin,
      }, getOrCreateActionIdempotencyKey("withdrawal"));
      setWithdrawResult({
        status: result.status,
        reference: result.reference,
        amount: withdrawQuote?.amount ?? amount.toFixed(2),
        fee: withdrawQuote?.fee ?? "0.00",
      });
      setWithdrawStep("result");
      setWithdrawPin("");
      clearActionIdempotencyKey("withdrawal");
      if (result.status === "SUCCESS" || result.status === "PENDING") {
        await refreshWallet();
      }
    } catch (error) {
      setWithdrawMessage(
        customerMessage(
          error,
          "We couldn't process this withdrawal right now.",
        ),
      );
    } finally {
      setWithdrawLoading(false);
    }
  }

  return (
    <div className="teksum-dashboard-page min-w-0 w-full grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
      <div className="space-y-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <WalletCards />
            </div>
            <CardTitle className="mt-4">Wallet & Funding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Available balance</p>
            <p className="mt-1 text-4xl font-black tabular-nums">
              {formatNaira(balance)}
            </p>
            {checking && (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Checking payment confirmation…
              </p>
            )}

            <div className="mt-6 rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">Wallet Funding Account</p>
                  <p className="mt-1 text-xs text-muted-foreground">Transfer NGN to your permanent TEKSUM funding account.</p>
                </div>
                <ShieldCheck className="size-5 text-emerald-500" />
              </div>
              {fundingAccountLoading ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Preparing your funding account…</p>
              ) : fundingAccount?.status === "ACTIVE" && fundingAccount.accountNumber ? (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Account name</p><p className="mt-1 break-words text-sm font-semibold">{fundingAccount.accountName || "—"}</p></div>
                    <div className="rounded-xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Bank</p><p className="mt-1 break-words text-sm font-semibold">{fundingAccount.bankName || "—"}</p></div>
                    <div className="rounded-xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Account number</p><p className="mt-1 font-mono text-lg font-bold tracking-wide">{fundingAccount.accountNumber}</p></div>
                    <div className="rounded-xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Currency / status</p><p className="mt-1 text-sm font-semibold">{fundingAccount.currency || "NGN"} · {fundingAccount.status}</p></div>
                  </div>
                  <Button type="button" variant="outline" onClick={() => navigator.clipboard?.writeText(fundingAccount.accountNumber || "")}>Copy account number</Button>
                </div>
              ) : (
                <div className="mt-4 space-y-4 rounded-xl border bg-muted/30 p-4">
                  <div>
                    <p className="font-semibold">Permanent Funding Account</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">TEKSUM may assign you a dedicated NGN bank account that you can use to fund your TEKSUM wallet. The account is provided through our payment partner and may be assigned immediately or remain pending while the provider completes its process.</p>
                  </div>
                  <label className="flex items-start gap-3 rounded-xl border bg-background p-3 text-sm leading-6">
                    <Checkbox
                      id="dva-consent"
                      checked={dvaConsent}
                      onCheckedChange={(checked) => setDvaConsent(checked === true)}
                      className="mt-1"
                    />
                    <span>By continuing, I expressly consent to TEKSUM using and sharing the necessary information with its payment partner to create and maintain my dedicated funding account. I have read the <Link href="/wallet-terms" className="font-semibold text-foreground underline underline-offset-2">Wallet & Funding Terms</Link> and <Link href="/privacy" className="font-semibold text-foreground underline underline-offset-2">Privacy Policy</Link>.</span>
                  </label>
                  <Button type="button" onClick={requestFundingAccount} disabled={!dvaConsent} className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
                    {fundingAccount?.status === "PENDING" ? "Check funding account" : "Continue"}
                  </Button>
                  {fundingAccount?.status === "PENDING" && (
                    <p className="text-xs text-muted-foreground">Your permanent funding account is still being assigned. You can check again later.</p>
                  )}
                  {fundingAccountMessage && (
                    <p className="rounded-xl border bg-background p-3 text-sm">{fundingAccountMessage}</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-muted/50 p-5">
              <p className="text-sm font-bold">Add money to your wallet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose an amount, complete the secure checkout, and TEKSUM will
                verify the payment before crediting your wallet.
              </p>
              <form
                onSubmit={fund}
                className="mt-4 flex flex-col gap-2 sm:flex-row"
              >
                <Input
                  type="number"
                  min={100}
                  max={10000000}
                  step="0.01"
                  value={fundAmount}
                  onChange={(event) =>
                    setFundAmount(Number(event.target.value))
                  }
                />
                <Button
                  type="submit"
                  disabled={fundLoading || fundAmount < 100}
                  className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {fundLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Fund wallet"
                  )}
                </Button>
              </form>
              {fundMessage && (
                <p className="mt-3 rounded-xl border bg-background p-3 text-sm">
                  {fundMessage}
                </p>
              )}
              {checkoutUrl && (
                <Button
                  className="mt-3"
                  variant="outline"
                  render={
                    <a href={checkoutUrl} target="_blank" rel="noreferrer" />
                  }
                >
                  Open secure checkout <ExternalLink />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Withdraw to your bank</CardTitle>
            <p className="text-sm text-muted-foreground">
              Verify your account, review the withdrawal, then confirm it with
              your transaction PIN.
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-5 rounded-2xl border bg-muted/30 p-4 text-sm">
              <p className="font-semibold">Withdrawal fees</p>
              <p className="mt-1 leading-6 text-muted-foreground">The current TEKSUM withdrawal fee is <span className="font-semibold text-foreground">1% of the withdrawal amount, subject to a minimum fee of ₦20</span>. The amount you enter is the full wallet debit; your bank receives the amount after the TEKSUM fee is deducted.</p>
              <p className="mt-2 text-xs text-muted-foreground">Example: ₦1,000 withdrawal → ₦20 fee → ₦980 received. See the <Link href="/wallet-terms" className="font-semibold text-foreground underline underline-offset-2">Wallet & Funding Terms</Link>.</p>
            </div>
            {banks.length === 0 ? (
              <div className="rounded-2xl border bg-muted/30 p-5 text-sm text-muted-foreground">
                Bank withdrawal is temporarily unavailable because the bank
                list could not be loaded. Please try again shortly.
              </div>
            ) : (
              <>
                {withdrawStep === "details" && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Bank</label>
                      <select
                        value={bankCode}
                        onChange={(event) => {
                          setBankCode(event.target.value);
                          setAccountName("");
                          setWithdrawQuote(null);
                          setWithdrawMessage("");
                        }}
                        className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                        required
                      >
                        <option value="">Select your bank</option>
                        {banks.map((bank) => (
                          <option key={bank.code} value={bank.code}>{bank.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Account number</label>
                      <div className="flex gap-2">
                        <Input
                          value={accountNumber}
                          onChange={(event) => {
                            setAccountNumber(event.target.value.replace(/\D/g, "").slice(0, 10));
                            setAccountName("");
                            setWithdrawQuote(null);
                            setWithdrawMessage("");
                          }}
                          inputMode="numeric"
                          placeholder="10-digit account number"
                          maxLength={10}
                          required
                        />
                        <Button type="button" variant="outline" disabled={verifyingAccount} onClick={verifyAccount}>
                          {verifyingAccount ? <Loader2 className="animate-spin" /> : "Verify"}
                        </Button>
                      </div>
                    </div>

                    {accountName && (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
                        <p className="text-xs text-muted-foreground">Verified account name</p>
                        <p className="mt-1 flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="size-4 text-emerald-500" />
                          {accountName}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-medium">Amount to withdraw</label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={withdrawAmountInput}
                        onChange={(event) => {
                          setWithdrawAmountInput(event.target.value);
                          setWithdrawQuote(null);
                          setWithdrawMessage("");
                        }}
                        placeholder="Enter amount"
                        inputMode="decimal"
                        required
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        The amount entered is the wallet debit. TEKSUM&apos;s fee is
                        taken from that amount, and the remaining amount is sent
                        to the verified bank account.
                      </p>
                    </div>

                    {withdrawQuoteLoading && (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Checking withdrawal limits, fee and wallet balance…
                      </p>
                    )}

                    {withdrawQuote && (
                      <div className="rounded-2xl border bg-muted/30 p-4">
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Withdrawal amount</span>
                            <span className="font-semibold tabular-nums">{formatNaira(withdrawQuote.amount)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">TEKSUM fee</span>
                            <span className="font-semibold tabular-nums">{formatNaira(withdrawQuote.fee)}</span>
                          </div>
                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-semibold">You will receive</span>
                              <span className="font-bold tabular-nums">{formatNaira(withdrawQuote.payoutAmount)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Current wallet balance</span>
                            <span className="font-semibold tabular-nums">{formatNaira(withdrawQuote.walletBalance)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Balance after withdrawal</span>
                            <span className="font-semibold tabular-nums">{formatNaira(withdrawQuote.walletBalanceAfter)}</span>
                          </div>
                        </div>

                        {!withdrawQuote.canWithdraw && (
                          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
                            <p className="font-semibold text-destructive">This withdrawal cannot be confirmed yet.</p>
                            <p className="mt-1 text-muted-foreground">
                              {withdrawalReasonMessage(withdrawQuote.reasons, withdrawQuote)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      type="button"
                      disabled={
                        !accountName ||
                        !/^\d{10}$/.test(accountNumber) ||
                        !Number.isFinite(Number(withdrawAmountInput)) ||
                        Number(withdrawAmountInput) <= 0 ||
                        withdrawQuoteLoading ||
                        !withdrawQuote?.canWithdraw ||
                        withdrawQuote.amount !== Number(withdrawAmountInput).toFixed(2)
                      }
                      onClick={continueToReview}
                      className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Review withdrawal
                    </Button>

                    {withdrawMessage && (
                      <p className="rounded-xl border bg-muted/30 p-3 text-sm">{withdrawMessage}</p>
                    )}
                  </div>
                )}

                {withdrawStep === "review" && withdrawQuote && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border bg-muted/30 p-5">
                      <p className="text-sm font-bold">Review withdrawal</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Check the beneficiary and wallet impact before final PIN confirmation.
                      </p>

                      <div className="mt-5 space-y-4 text-sm">
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-muted-foreground">Bank</span>
                          <span className="text-right font-semibold">{banks.find((bank) => bank.code === bankCode)?.name || bankCode}</span>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-muted-foreground">Account</span>
                          <span className="font-mono font-semibold">••••{accountNumber.slice(-4)}</span>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-muted-foreground">Account name</span>
                          <span className="max-w-[60%] text-right font-semibold">{accountName}</span>
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Withdrawal amount</span>
                            <span className="font-semibold tabular-nums">{formatNaira(withdrawQuote.amount)}</span>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">TEKSUM fee</span>
                            <span className="font-semibold tabular-nums">{formatNaira(withdrawQuote.fee)}</span>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-4">
                            <span className="font-semibold">Total wallet debit</span>
                            <span className="font-bold tabular-nums">{formatNaira(withdrawQuote.amount)}</span>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">You will receive</span>
                            <span className="font-semibold tabular-nums">{formatNaira(withdrawQuote.payoutAmount)}</span>
                          </div>
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Current wallet balance</span>
                            <span className="font-semibold tabular-nums">{formatNaira(withdrawQuote.walletBalance)}</span>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Balance after withdrawal</span>
                            <span className="font-bold tabular-nums">{formatNaira(withdrawQuote.walletBalanceAfter)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setWithdrawStep("details");
                          setWithdrawMessage("");
                        }}
                        className="flex-1 rounded-xl"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setWithdrawStep("pin");
                          setWithdrawMessage("");
                        }}
                        className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Continue to PIN
                      </Button>
                    </div>
                  </div>
                )}

                {withdrawStep === "pin" && (
                  <form onSubmit={withdraw} className="space-y-4">
                    <div className="rounded-2xl border bg-muted/30 p-5">
                      <p className="text-sm font-bold">Confirm withdrawal</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Enter your 4-digit transaction PIN to authorize this withdrawal.
                      </p>
                      {withdrawQuote && (
                        <div className="mt-4 rounded-xl bg-background p-4 text-sm">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Wallet debit</span>
                            <span className="font-semibold tabular-nums">{formatNaira(withdrawQuote.amount)}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">You will receive</span>
                            <span className="font-semibold tabular-nums">{formatNaira(withdrawQuote.payoutAmount)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Transaction PIN</label>
                      <Input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={withdrawPin}
                        onChange={(event) => setWithdrawPin(event.target.value.replace(/\D/g, ""))}
                        placeholder="••••"
                        autoComplete="off"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setWithdrawStep("review");
                          setWithdrawPin("");
                          setWithdrawMessage("");
                        }}
                        className="flex-1 rounded-xl"
                        disabled={withdrawLoading}
                      >
                        Back to review
                      </Button>
                      <Button
                        type="submit"
                        disabled={withdrawLoading || withdrawPin.length !== 4 || !accountName || !withdrawQuote?.canWithdraw}
                        className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        {withdrawLoading ? <Loader2 className="animate-spin" /> : "Confirm withdrawal"}
                      </Button>
                    </div>

                    {withdrawMessage && (
                      <p className="rounded-xl border bg-muted/30 p-3 text-sm">{withdrawMessage}</p>
                    )}
                  </form>
                )}

                {withdrawStep === "result" && withdrawResult && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border bg-muted/30 p-5">
                      <p className="text-sm font-bold">
                        {withdrawResult.status === "SUCCESS"
                          ? "Withdrawal successful"
                          : withdrawResult.status === "PENDING"
                            ? "Withdrawal pending"
                            : `Withdrawal ${withdrawResult.status.toLowerCase()}`}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {withdrawResult.status === "SUCCESS"
                          ? "The withdrawal was confirmed by the backend."
                          : withdrawResult.status === "PENDING"
                            ? "Your withdrawal has been submitted and is awaiting provider confirmation."
                            : "The withdrawal was not completed. Check Transactions for the latest status."}
                      </p>

                      <div className="mt-5 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-semibold tabular-nums">{formatNaira(withdrawResult.amount)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">TEKSUM fee</span>
                          <span className="font-semibold tabular-nums">{formatNaira(withdrawResult.fee)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Account</span>
                          <span className="font-semibold">{accountName}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Reference</span>
                          <span className="font-mono text-xs font-semibold">{withdrawResult.reference}</span>
                        </div>
                      </div>
                    </div>

                    <Button type="button" variant="outline" onClick={resetWithdrawal} className="w-full rounded-xl">
                      Start another withdrawal
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="h-fit rounded-2xl">
        <CardHeader>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <ShieldCheck />
          </div>
          <CardTitle className="mt-4">Your wallet, your control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="font-semibold text-foreground">
              Fund when you need it
            </p>
            <p className="mt-1">
              Keep enough balance for your everyday data, airtime, bills and
              digital purchases.
            </p>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="font-semibold text-foreground">
              Verify before money moves
            </p>
            <p className="mt-1">
              Funding and withdrawals are confirmed securely before your balance is updated.
            </p>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="font-semibold text-foreground">
              Everything stays traceable
            </p>
            <p className="mt-1">
              Funding, purchases and withdrawals appear in your transaction
              history with their current status.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
