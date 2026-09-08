import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/public-shell"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the TEKSUM Privacy Policy covering account, identity, transaction, financial and technical information.",
  alternates: { canonical: "/privacy" },
}

const sections = [
  ["1. Who this Policy is for", "This Privacy Policy explains how TEKSUM handles personal data in connection with the TEKSUM website, account services, wallet, digital services and customer support. The TEKSUM entity responsible for a particular processing activity may depend on the service and applicable legal arrangements."],
  ["2. Information we collect", "We may collect information you provide when creating or managing an account, including your name, email address, phone number and account-security information. We may also process transaction references, wallet and ledger information, service purchase information, bank account details supplied for withdrawals, dedicated funding-account information, support communications and technical information required to operate and secure the platform."],
  ["3. Financial and transaction information", "When you fund your wallet, purchase a service or request a withdrawal, TEKSUM may process transaction amounts, references, statuses, provider references, fees, payout information and related reconciliation records. Bank account information used for a withdrawal is processed for account verification and payment purposes and may be shared with the relevant payment provider where necessary to complete the transaction."],
  ["4. Dedicated funding account information", "Where you request a permanent funding account, TEKSUM may share necessary customer information, such as your name, email address and phone number, with the appointed payment partner to create, assign, maintain and reconcile the dedicated account. A dedicated funding account is created only after the applicable customer consent step has been completed in the TEKSUM interface."],
  ["5. Why we process information", "Depending on the circumstances and applicable law, TEKSUM may process personal data to create and manage your account; authenticate and secure access; provide digital services; process and reconcile payments; verify withdrawal accounts; prevent fraud and abuse; maintain financial and transaction records; respond to support requests; comply with legal obligations; protect the platform and users; and perform other legitimate operational purposes disclosed to you."],
  ["6. Lawful bases", "TEKSUM will seek to rely on a lawful basis applicable to the processing concerned, which may include performance of a contract, compliance with a legal obligation, protection of legitimate interests, public-interest grounds where applicable, or consent where consent is the appropriate basis. Where consent is relied upon, the applicable consent mechanism will be presented in a manner intended to allow an informed choice."],
  ["7. Service providers and third parties", "TEKSUM may use payment processors, banking or account-verification providers, digital-service vendors, infrastructure providers, communications providers and other processors required to operate the platform. Such parties receive information only to the extent reasonably necessary for the relevant service, subject to the applicable contractual, security and legal arrangements."],
  ["8. Retention", "Personal data and transaction records are retained for as long as reasonably necessary for the purpose for which they were collected, to maintain security and reconciliation, to resolve disputes, or to comply with legal, accounting, regulatory or other lawful obligations. Different categories of records may therefore have different retention periods."],
  ["9. Security", "TEKSUM applies technical and organisational safeguards intended to protect personal data against unauthorised or unlawful access, loss, destruction, alteration or disclosure. You are also responsible for protecting your password, transaction PIN, MFA credentials and verification codes and for notifying TEKSUM promptly where you suspect compromise."],
  ["10. Your data-subject rights", "Subject to applicable law and lawful limitations, you may have rights including the right to be informed, access, rectification, objection, restriction, portability, erasure and withdrawal of consent where consent is the applicable legal basis. You may also have the right to lodge a complaint with the Nigeria Data Protection Commission or another competent authority."],
  ["11. Withdrawal of consent", "Where TEKSUM processes information on the basis of consent, you may withdraw that consent through the available mechanism or by contacting TEKSUM. Withdrawal does not affect processing lawfully carried out before the withdrawal and does not necessarily require TEKSUM to erase records that it is otherwise entitled or obliged to retain."],
  ["12. Complaints and requests", "For privacy requests or complaints, please use the contact details published on the TEKSUM Contact page. TEKSUM may request reasonable information necessary to verify the identity of the person making a request and to protect against unauthorised disclosure."],
  ["13. Changes to this Policy", "This Privacy Policy may be updated where the service, processing arrangements, legal requirements or security practices change. Where required, TEKSUM will provide an appropriate notice of material changes. The date of the latest update is stated below."],
]

export default function Privacy() {
  return (
    <PublicShell>
      <main className="min-w-0 mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">Legal</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: September 2026</p>
        <div className="mt-8 flex flex-wrap gap-2 text-sm">
          <Link href="/register" className="rounded-xl border px-3 py-2 font-semibold hover:bg-muted">Return to Registration</Link>
          <Link href="/terms" className="rounded-xl border px-3 py-2 font-semibold hover:bg-muted">Terms & Conditions</Link>
          <Link href="/wallet-terms" className="rounded-xl border px-3 py-2 font-semibold hover:bg-muted">Wallet & Funding Terms</Link>
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
