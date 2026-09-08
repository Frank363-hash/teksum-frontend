import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/public-shell"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Read the TEKSUM Terms & Conditions governing accounts, wallets, payments, digital services, transactions, withdrawals and refunds.",
  alternates: { canonical: "/terms" },
}

const sections = [
  ["1. Introduction", "These Terms & Conditions govern your access to and use of TEKSUM and the digital services made available through the platform. By using TEKSUM, you agree to comply with these Terms, our Privacy Policy and any service-specific terms displayed to you before a transaction."],
  ["2. Account ownership and information", "You shall provide information that is accurate, complete and reasonably capable of being verified. Your TEKSUM account is personal to you and must not be sold, transferred, lent or otherwise made available to another person. You remain responsible for activity carried out through your account until you notify TEKSUM of suspected unauthorised activity."],
  ["3. Wallet and funding", "Your TEKSUM wallet is an internal account record used to reflect funds available for supported TEKSUM transactions. Wallet funding may be made through the payment methods presented by TEKSUM, including a dedicated funding account where one has been assigned to you. A funding transaction is credited only after the applicable payment confirmation and reconciliation processes have been completed."],
  ["4. Permanent funding account", "Where you request a permanent funding account, TEKSUM may share the information reasonably required for the creation and maintenance of that account with its appointed payment partner. The dedicated account is intended for funding your TEKSUM wallet and is not a personal bank account for unrelated banking purposes. Assignment may be subject to provider availability, verification, compliance requirements and asynchronous processing."],
  ["5. Wallet credits and transaction records", "A wallet credit is subject to successful confirmation and reconciliation. A transaction may be marked pending, successful, failed or reversed. A pending transaction should not be duplicated merely because confirmation has not yet been received. Transaction records may be retained for accounting, reconciliation, security, legal and regulatory purposes."],
  ["6. Withdrawals and fees", "Withdrawals are subject to the limits, verification requirements and conditions displayed by TEKSUM and enforced by the service. The applicable withdrawal charge is calculated by TEKSUM and disclosed to you in the withdrawal review before you confirm the transaction. The amount entered by you is the full wallet debit; the amount paid to your verified bank account is the withdrawal amount less the applicable charge. The applicable charge may comprise provider-related and other permitted transaction costs and may change where the underlying cost or applicable requirements change."],
  ["7. Transaction PIN and account security", "You are responsible for keeping your password, transaction PIN, MFA credentials, verification codes and other security information confidential. TEKSUM will not ordinarily ask you to disclose a transaction PIN or one-time security code through an unsolicited message. You should promptly report suspected compromise, unauthorised activity or fraudulent instructions through the official support channels."],
  ["8. Digital services", "Data, airtime, cable television, electricity, education products and other services are supplied subject to the applicable provider, catalogue, network and operational conditions. Product availability, prices and service specifications may change. A service may be temporarily unavailable because of provider, network, maintenance, regulatory or other operational circumstances."],
  ["9. Failed, pending, reversed transactions and refunds", "Where a transaction fails, remains pending or is reversed, TEKSUM may take reasonable steps to reconcile the transaction and restore any amount properly due to you. Refunds are subject to the transaction status, the applicable provider's rules and TEKSUM's reconciliation process. You should provide the transaction reference when requesting assistance and should not initiate duplicate purchases while a transaction remains pending."],
  ["10. Prohibited activity and fraud", "You shall not use TEKSUM for unlawful activity, fraud, attempted fraud, money laundering, impersonation, abuse of payment channels, unauthorised access, manipulation of transaction records or any activity intended to circumvent security or service controls. TEKSUM may suspend or restrict an account where reasonably necessary to protect users, funds, systems, service providers or comply with applicable law."],
  ["11. Service availability", "TEKSUM aims to provide reliable service but does not warrant uninterrupted availability. Network outages, provider failures, maintenance, security incidents, regulatory requirements and events outside TEKSUM's reasonable control may affect service delivery or transaction timing."],
  ["12. Account suspension and termination", "TEKSUM may restrict, suspend or terminate an account where there is a security concern, suspected fraud or prohibited activity, a legal or regulatory requirement, a material breach of these Terms, or another legitimate reason affecting the integrity of the platform. Account closure does not automatically extinguish obligations or records that must lawfully survive termination."],
  ["13. Disputes and support", "Customers should first report transaction, wallet, privacy or account concerns through the official TEKSUM support channels. Where a dispute concerns a payment or service provider, TEKSUM may require the relevant provider to participate in the investigation or reconciliation. Nothing in these Terms removes any mandatory right or remedy available to a consumer under applicable law."],
  ["14. Changes to these Terms", "TEKSUM may update these Terms from time to time to reflect changes in the service, law, security requirements or operational arrangements. Material changes will be communicated through an appropriate channel where required. The date shown at the beginning or end of this document indicates the latest update."],
  ["15. Applicable law and jurisdiction", "These Terms are intended to be governed by the laws of the Federal Republic of Nigeria, subject to any mandatory consumer, data-protection or other statutory protections applicable to the customer. Any contractual dispute shall be dealt with in accordance with applicable Nigerian law and the competent forum having jurisdiction."],
]

export default function Terms() {
  return (
    <PublicShell>
      <main className="min-w-0 mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">Legal</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Terms & Conditions</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: September 2026</p>
        <div className="mt-8 flex flex-wrap gap-2 text-sm">
          <Link href="/register" className="rounded-xl border px-3 py-2 font-semibold hover:bg-muted">Return to Registration</Link>
          <Link href="/wallet-terms" className="rounded-xl border px-3 py-2 font-semibold hover:bg-muted">Wallet & Funding Terms</Link>
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
