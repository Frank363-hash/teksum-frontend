import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/public-shell"

export const metadata: Metadata = {
  title: "Wallet & Funding Terms",
  description: "TEKSUM wallet funding, permanent funding account, withdrawal, fees, transaction and refund terms.",
  alternates: { canonical: "/wallet-terms" },
}

const sections = [
  ["1. Wallet", "Your TEKSUM wallet is the balance maintained for your TEKSUM account and may be used for supported services and other wallet functions made available to you. The wallet balance is an internal record of funds credited to your account and is not represented as a bank deposit or separate bank account unless expressly stated otherwise."],
  ["2. Wallet funding", "Wallet funding may be completed through secure checkout or a permanent dedicated funding account assigned to you. A payment is not treated as available wallet funds merely because you initiated it; TEKSUM credits the wallet after the applicable payment confirmation, webhook and reconciliation processes have succeeded."],
  ["3. Permanent funding account", "TEKSUM may arrange a dedicated NGN funding account through its payment partner. The account is intended to receive transfers for your TEKSUM wallet. Assignment may be immediate or asynchronous and may remain pending where the payment provider has not completed the assignment."],
  ["4. DVA consent", "Creating and maintaining a dedicated funding account requires the use of personal customer information. Before TEKSUM requests or displays a permanent funding account for you, the interface will require your express agreement that TEKSUM may use and share the necessary information with its payment partner for that purpose. The permanent funding account should not be requested on the basis of a default or implied consent."],
  ["5. Wallet credits", "Wallet credits are subject to confirmation and reconciliation. Where a transfer cannot yet be confirmed, the related transaction may remain pending. If a credit is later determined to have been erroneous, duplicated, reversed or otherwise not properly due, TEKSUM may take reasonable steps to correct the wallet ledger, subject to applicable law and the transaction history."],
  ["6. Withdrawals", "Withdrawals are made from the available wallet balance to a verified Nigerian bank account. TEKSUM may require bank-account verification and your transaction PIN before a withdrawal is submitted. A withdrawal may be pending while the payment provider processes it and may subsequently become successful, failed or reversed."],
  ["7. Withdrawal fee", "The applicable withdrawal charge is calculated by TEKSUM and disclosed to you before you confirm a withdrawal. The amount entered is the full amount debited from your TEKSUM wallet. The net amount paid to your verified bank account is the entered amount less the applicable charge. The charge may comprise provider-related and other permitted transaction costs and may change where the underlying cost or applicable requirements change."],
  ["8. Withdrawal limits", "Withdrawals are subject to the minimum, maximum and daily limits applicable to your account and disclosed by TEKSUM. The service may refuse or delay a withdrawal where the amount is below the minimum, exceeds an applicable limit, exceeds your available wallet balance, or otherwise fails a security or processing requirement."],
  ["9. Pending, failed and reversed transactions", "Do not repeat a wallet funding or withdrawal instruction solely because a transaction is pending. Check the transaction record and allow the relevant confirmation or reconciliation process to complete. Where a transaction fails or is reversed, TEKSUM will process the resulting wallet adjustment in accordance with the transaction state and applicable provider rules."],
  ["10. Refunds and disputes", "Refunds depend on the nature and status of the transaction and may require provider confirmation or reconciliation. Where you dispute a wallet credit, purchase or withdrawal, provide the transaction reference and relevant details through TEKSUM support. TEKSUM may request additional information reasonably necessary to investigate the matter."],
  ["11. Security", "Never disclose your transaction PIN, MFA code, password or one-time verification code to another person. TEKSUM may restrict a wallet or withdrawal where there is a reasonable security, fraud or compliance concern. You should report suspected unauthorised transactions promptly."],
  ["12. Changes and service availability", "Funding methods, payment providers, account-assignment arrangements, fees, limits and supported services may change where necessary for operational, security, legal or provider reasons. Material changes will be communicated where required by applicable law or the applicable contract terms."],
]

export default function WalletTerms() {
  return (
    <PublicShell>
      <main className="min-w-0 mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">Financial terms</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Wallet & Funding Terms</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: September 2026</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-4"><p className="text-xs text-muted-foreground">Minimum withdrawal</p><p className="mt-1 text-lg font-black">₦1,000</p></div>
          <div className="rounded-2xl border bg-card p-4"><p className="text-xs text-muted-foreground">Withdrawal fee</p><p className="mt-1 text-lg font-black">Shown before confirmation</p></div>
          <div className="rounded-2xl border bg-card p-4"><p className="text-xs text-muted-foreground">Wallet debit</p><p className="mt-1 text-lg font-black">Entered amount</p></div>
        </div>
        <div className="mt-8 flex flex-wrap gap-2 text-sm">
          <Link href="/register" className="rounded-xl border px-3 py-2 font-semibold hover:bg-muted">Return to Registration</Link>
          <Link href="/terms" className="rounded-xl border px-3 py-2 font-semibold hover:bg-muted">Terms & Conditions</Link>
          <Link href="/privacy" className="rounded-xl border px-3 py-2 font-semibold hover:bg-muted">Privacy Policy</Link>
        </div>
        <div className="mt-10 space-y-8">
          {sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="text-lg font-bold">{heading}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p>
            </section>
          ))}
        </div>
      </main>
    </PublicShell>
  )
}
