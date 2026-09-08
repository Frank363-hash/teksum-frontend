"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = String(data.get("subject") || "TEKSUM support request");
    const body = [
      `Name: ${data.get("name") || ""}`,
      `Email: ${data.get("email") || ""}`,
      `Issue type: ${data.get("issue") || ""}`,
      `Transaction reference: ${data.get("reference") || "Not provided"}`,
      "",
      String(data.get("message") || ""),
    ].join("\n");
    if (!supportEmail) return;
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-3xl border bg-card p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Name
          </label>
          <Input id="name" name="name" required placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="issue" className="mb-2 block text-sm font-medium">
            Issue type
          </label>
          <select
            id="issue"
            name="issue"
            className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
          >
            <option>Transaction issue</option>
            <option>Wallet issue</option>
            <option>Account issue</option>
            <option>General enquiry</option>
          </select>
        </div>
        <div>
          <label htmlFor="reference" className="mb-2 block text-sm font-medium">
            Transaction reference{" "}
            <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input id="reference" name="reference" placeholder="VEND-..." />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="mb-2 block text-sm font-medium">
          Subject
        </label>
        <Input
          id="subject"
          name="subject"
          required
          placeholder="What do you need help with?"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium">
          Message
        </label>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Tell us what happened. Include the transaction reference if this is about a payment."
        />
      </div>
      {sent && (
        <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          Your email client has been opened with the report details.
        </p>
      )}
      <Button
        type="submit"
        disabled={!supportEmail}
        className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
      >
        Send support request
      </Button>
    </form>
  );
}
