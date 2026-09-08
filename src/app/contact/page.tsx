import type { Metadata } from "next";
import { Mail, MessageCircle, ReceiptText } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Support",
  description: "Contact TEKSUM support for help with digital services and transactions.",
  alternates: { canonical: "/contact" },
};
import { PublicShell } from "@/components/public-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/teksum/contact-form";

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "";
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || "";
function whatsappHref(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits.startsWith("0") ? `234${digits.slice(1)}` : digits}`;
}

export default function Contact() {
  const whatsapp = whatsappHref(whatsappNumber);
  return (
    <PublicShell>
      <main className="min-w-0 mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">
          Support
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Need help?
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Tell us what happened and include your transaction reference when
          relevant.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {supportEmail && (
            <Card>
              <CardHeader>
                <Mail className="size-5 text-emerald-500" />
                <CardTitle className="text-base">Email support</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                  href={`mailto:${supportEmail}`}
                >
                  {supportEmail}
                </a>
              </CardContent>
            </Card>
          )}
          {whatsapp && (
            <Card>
              <CardHeader>
                <MessageCircle className="size-5 text-emerald-500" />
                <CardTitle className="text-base">WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                >
                  Chat with TEKSUM support
                </a>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <ReceiptText className="size-5 text-emerald-500" />
              <CardTitle className="text-base">Transaction issue</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Include the transaction reference with your report.
            </CardContent>
          </Card>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
          <section>
            <h2 className="text-2xl font-black">File a support request</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Send the details of your issue and our support team can follow up.
            </p>
          </section>
          <ContactForm />
        </div>
      </main>
    </PublicShell>
  );
}
