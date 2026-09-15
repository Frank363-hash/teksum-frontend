"use client";
import { CustomerFeedback } from "@/components/teksum/customer-feedback";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { educationProviders as educationProviderCatalog } from "@/components/teksum/service-discovery";
import { CheckCircle2, Loader2, ShieldCheck, MailCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getCapabilities,
  getPlans,
  getPricingRules,
  getProfile,
  getSecurity,
  type Plan,
  purchase,
  verifyCustomer,
  ApiError,
  formatNaira,
  customerMessage,
  getOrCreateActionIdempotencyKey,
  clearActionIdempotencyKey,
} from "@/lib/teksum-api";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const networkProviders = [
  ["mtn", "MTN"],
  ["airtel", "Airtel"],
  ["glo", "Glo"],
  ["9mobile", "9mobile"],
] as const;

const providerImages: Record<string, string> = {
  mtn: "/images/providers/mtn.png",
  airtel: "/images/providers/airtel.png",
  glo: "/images/providers/glo.png",
  "9mobile": "/images/providers/9mobile.png",
  dstv: "/images/providers/dstv.png",
  gotv: "/images/providers/gotv.png",
  startimes: "/images/providers/startimes.png",
  showmax: "/images/providers/showmax.png",
  waec: "/images/providers/waec.png",
  neco: "/images/providers/neco.png",
  nabteb: "/images/providers/nabteb.png",
  jamb: "/images/providers/jamb.png",
};

const cableProviders = [
  ["dstv", "DStv"],
  ["gotv", "GOtv"],
  ["startimes", "Startimes"],
  ["showmax", "Showmax"],
] as const;

const educationProviders = [
  ["waec", "WAEC"],
  ["neco", "NECO"],
  ["nabteb", "NABTEB"],
  ["jamb", "JAMB"],
] as const;

type Category =
  | "DATA"
  | "AIRTIME"
  | "EDUCATION_PIN"
  | "AIRTIME_PIN"
  | "CABLE"
  | "ELECTRICITY";

type Props = {
  category: Category;
  title: string;
  description: string;
  publicMode?: boolean;
  initialNetwork?: string;
  initialPlanId?: string;
  fixedPlanId?: string;
  dynamicAmount?: boolean;
  lockSelection?: boolean;
};

type Rule = {
  minAmount: string;
  maxAmount: string;
  fixedFee: string;
  markupPercent: string;
  description?: string | null;
};

const phoneCategories = new Set<Category>(["AIRTIME", "DATA"]);

function maskSensitiveIdentifier(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed.length <= 4) return "*".repeat(trimmed.length);
  return `${"*".repeat(Math.max(3, trimmed.length - 4))}${trimmed.slice(-4)}`;
}

function PurchaseResultView({
  result,
  title,
  planName,
  amount,
  beneficiary,
}: {
  result: Awaited<ReturnType<typeof purchase>>;
  title: string;
  planName: string;
  amount: number;
  beneficiary: string;
}) {
  const status = String(result.status || "").toUpperCase();
  const reference = result.reference || "Available in Transactions";
  const transactionHref = result.reference
    ? `/dashboard/transactions/${encodeURIComponent(result.reference)}`
    : "/dashboard/transactions";

  const createdAt =
    "createdAt" in result && typeof result.createdAt === "string"
      ? result.createdAt
      : null;

  const details: Array<[string, string]> = [
    ["Service", title],
    ["Product", planName],
    ["Amount", formatNaira(amount)],
    ...(beneficiary ? [["Recipient", beneficiary] as [string, string]] : []),
    ["Transaction reference", reference],
    ...(createdAt
      ? [["Date & time", formatDate(createdAt)] as [string, string]]
      : []),
  ];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      {status === "SUCCESS" ? (
        <>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[.07] p-6 text-center sm:p-8">
            <CheckCircle2 className="mx-auto size-14 text-emerald-500" />
            <h2 className="mt-4 text-2xl font-black tracking-tight">
              Purchase Successful
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Your purchase has been completed successfully. You can view the
              full transaction details at any time.
            </p>
          </div>
          <ResultDetails details={details} />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"

              render={<Link href={transactionHref} />}

            >View Transaction</Button>
            <Button variant="outline" className="rounded-xl"

              render={<Link href="/dashboard" />}

            >Back to Dashboard</Button>
          </div>
        </>
      ) : status === "PENDING" ? (
        <>
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[.07] p-6 text-center sm:p-8">
            <Loader2 className="mx-auto size-14 text-amber-500" />
            <h2 className="mt-4 text-2xl font-black tracking-tight">
              Transaction Pending
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Your request is still being processed. We have not received a
              final result yet. Check Transactions for the latest status.
            </p>
          </div>
          <ResultDetails details={details} />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"

              render={<Link href={transactionHref} />}

            >View Transaction</Button>
            <Button variant="outline" className="rounded-xl"

              render={<Link href="/dashboard/transactions" />}

            >View Transactions</Button>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-2xl border border-red-500/30 bg-red-500/[.06] p-6 text-center sm:p-8">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-red-500/30 text-red-500">
              <span className="text-3xl font-bold" aria-hidden="true">×</span>
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight">
              Transaction Failed
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              We couldn't complete this transaction. Check the transaction
              details for the latest status and available information.
            </p>
          </div>
          <ResultDetails details={details} />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"

              render={<Link href={transactionHref} />}

            >View Transaction</Button>
            <Button variant="outline" className="rounded-xl"

              render={<Link href="/dashboard" />}

            >Back to Dashboard</Button>
          </div>
        </>
      )}
    </div>
  );
}

function ResultDetails({ details }: { details: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {details.map(([label, value]) => (
        <div key={label} className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 break-words font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}

export function ServiceForm({
  category,
  title,
  description,
  publicMode = false,
  initialNetwork,
  initialPlanId,
  fixedPlanId,
  dynamicAmount = false,
  lockSelection = false,
}: Props) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [profilePhone, setProfilePhone] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [network, setNetwork] = useState(
    category === "ELECTRICITY"
      ? ""
      : initialNetwork ||
        (category === "CABLE"
          ? "dstv"
          : category === "EDUCATION_PIN"
            ? "waec"
            : "mtn"),
  );
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState(initialPlanId || "");
  const [beneficiaryPhone, setBeneficiaryPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [pin, setPin] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [meterType, setMeterType] = useState("prepaid");
  const [subscriptionType, setSubscriptionType] = useState<"renew" | "change">(
    "renew",
  );
  const [jambProfileCode, setJambProfileCode] = useState("");
  const [jambEmail, setJambEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [message, setMessage] = useState("");
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [status, setStatus] = useState("");
  const [capabilities, setCapabilities] = useState<unknown[]>([]);
  const [rule, setRule] = useState<Rule | null>(null);
  const [review, setReview] = useState(false);
  const [purchaseResult, setPurchaseResult] =
    useState<Awaited<ReturnType<typeof purchase>> | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verification, setVerification] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [verifiedKey, setVerifiedKey] = useState<string | null>(null);
  const pathname = usePathname();

  const needsBeneficiaryPhone = phoneCategories.has(category);
  const isJambRegistration =
    category === "EDUCATION_PIN" &&
    network === "jamb" &&
    (planId === "jamb:1" || planId === "jamb:2");

  useEffect(() => {
    getProfile({ redirectOn401: false })
      .then(async (profile) => {
        setAuthenticated(true);
        setProfilePhone(profile.phone || "");
        setProfileEmail(profile.email || "");
        setHasPin(profile.hasTransactionPin);
        try {
          const security = await getSecurity();
          setHasPin(security.transactionPinSet);
        } catch {
          // Profile already supplies the PIN state; security is supplemental.
        }
      })
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (!authenticated || category === "AIRTIME") return;

    if (category === "ELECTRICITY") {
      getCapabilities("ELECTRICITY")
        .then((result) => {
          const electricity = result.capabilities.ELECTRICITY || [];
          setCapabilities(electricity);
          setNetwork((current) => {
            if (
              current &&
              electricity.some((provider) => provider.code === current)
            ) {
              return current;
            }
            return electricity[0]?.code || "";
          });
        })
        .catch(() => {
          setCapabilities([]);
          setNetwork("");
        });
      return;
    }

    getCapabilities(category)
      .then((result) => setCapabilities(result.capabilities || []))
      .catch(() => setCapabilities([]));
  }, [authenticated, category]);

  useEffect(() => {
    if (!authenticated) return;
    const dynamic =
      dynamicAmount || category === "AIRTIME" || category === "ELECTRICITY";

    setMessage("");
    setReview(false);
    setPurchaseResult(null);

    if (category === "ELECTRICITY" && !network) {
      setPlans([]);
      setPlanId("AMOUNT");
      setRule(null);
      setLoadingPlans(false);
      return;
    }

    if (dynamic) {
      setPlans([]);
      setPlanId("AMOUNT");
      setLoadingPlans(true);
      getPricingRules(category, network)
        .then((rules) => setRule(rules[0] || null))
        .catch(() => setRule(null))
        .finally(() => setLoadingPlans(false));
      return;
    }

    setLoadingPlans(true);
    getPlans(category, network)
      .then((cataloguePlans) => {
        const catalogueMatchesService = (plan: Plan) =>
          plan.serviceCategory === category &&
          plan.networkProvider.toLowerCase() === network.toLowerCase();
        const available = fixedPlanId
          ? cataloguePlans.filter(
              (plan) => catalogueMatchesService(plan) && plan.planId === fixedPlanId,
            )
          : cataloguePlans.filter(catalogueMatchesService);

        setPlans(available);
        const preferred = fixedPlanId
          ? available[0]
          : initialPlanId
            ? available.find((plan) => plan.planId === initialPlanId)
            : undefined;
        setPlanId(preferred?.planId || available[0]?.planId || "");
        setQuantity(1);
      })
      .catch((error) => {
        setPlans([]);
        setPlanId("");
        setMessage(
          customerMessage(
            error,
            "We couldn't load the available options right now.",
          ),
        );
      })
      .finally(() => setLoadingPlans(false));
  }, [
    authenticated,
    category,
    network,
    initialPlanId,
    fixedPlanId,
      dynamicAmount,
  ]);

  const providerOptions: readonly (readonly [string, string])[] =
    category === "CABLE"
      ? cableProviders
      : category === "ELECTRICITY"
        ? capabilities.flatMap((capability) => {
            const provider = capability as {
              code?: string;
              name?: string;
            };
            return provider.code && provider.name
              ? ([[provider.code, provider.name]] as const)
              : [];
          })
        : category === "EDUCATION_PIN"
          ? educationProviders
          : networkProviders;

  function educationProviderHref(provider: string): string {
    const segments = pathname.split("/").filter(Boolean);
    const examPinsIndex = segments.indexOf("exam-pins");
    const productSlug =
      examPinsIndex >= 0 && segments.length > examPinsIndex + 2
        ? segments[examPinsIndex + 2]
        : null;
    const target = educationProviderCatalog.find((entry) => entry.slug === provider);
    const keepsCurrentProduct =
      Boolean(productSlug) &&
      Boolean(target?.products.some(([slug]) => slug === productSlug));

    return keepsCurrentProduct && productSlug
      ? `/dashboard/exam-pins/${provider}/${productSlug}`
      : `/dashboard/exam-pins/${provider}`;
  }

  const selected = useMemo(
    () => plans.find((plan) => plan.planId === planId),
    [plans, planId],
  );

  const redirectPath =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : `/services/${title.toLowerCase().replaceAll(" ", "-")}`;

  const dynamic =
    dynamicAmount || category === "AIRTIME" || category === "ELECTRICITY";
  const dynamicMin = Number(rule?.minAmount ?? 50);
  const dynamicMax = Number(rule?.maxAmount ?? 100000);
  const amountValue = Number(amount);
  const estimatedTotal =
    dynamic
      ? amount !== "" && rule
        ? amountValue * (1 + Number(rule.markupPercent) / 100) +
          Number(rule.fixedFee)
        : null
      : Number(selected?.sellingPrice || 0) * quantity;

  function validate() {
    if (!authenticated) return false;

    if (needsBeneficiaryPhone && !profilePhone) {
      setMessage(
        "Your account phone number is unavailable. Update your profile before purchasing.",
      );
      return false;
    }

    if (needsBeneficiaryPhone) {
      const normalizedPhone = beneficiaryPhone.replace(/\s+/g, "");
      if (!/^\+?\d{10,15}$/.test(normalizedPhone)) {
        setMessage("Enter a valid beneficiary phone number.");
        return false;
      }
    }

    if (category === "CABLE" && !accountNumber.trim()) {
      setMessage("Enter the smart card number.");
      return false;
    }

    if (category === "ELECTRICITY" && !accountNumber.trim()) {
      setMessage("Enter the meter number.");
      return false;
    }

    if (!dynamic && !planId) {
      setMessage(
        "No plans are available for this option right now. Please choose another option or try again later.",
      );
      return false;
    }

    if (
      !dynamic &&
      selected?.supportsBulk &&
      (!Number.isInteger(quantity) ||
        quantity < selected.minQuantity ||
        quantity > selected.maxQuantity)
    ) {
      setMessage(
        `Choose a quantity between ${selected.minQuantity} and ${selected.maxQuantity}.`,
      );
      return false;
    }

    if (
      dynamic &&
      (!Number.isFinite(amountValue) || amountValue < dynamicMin || amountValue > dynamicMax)
    ) {
      setMessage(
        `Enter an amount between ${formatNaira(dynamicMin)} and ${formatNaira(dynamicMax)}.`,
      );
      return false;
    }

    if (isJambRegistration && (!profilePhone || !jambProfileCode || !jambEmail)) {
      setMessage(
        "JAMB registration requires your account phone number, profile code, and email because the PIN is delivered to your registered contact details.",
      );
      return false;
    }

    return true;
  }

  const customerVerificationKey = useMemo(() => {
    if (category === "CABLE") {
      return JSON.stringify({
        category,
        network,
        planId,
        accountNumber: accountNumber.trim(),
        subscriptionType,
      });
    }
    if (category === "ELECTRICITY") {
      return JSON.stringify({
        category,
        network,
        accountNumber: accountNumber.trim(),
        meterType,
      });
    }
    return null;
  }, [category, network, planId, accountNumber, subscriptionType, meterType]);

  function verificationText(value: unknown): string | null {
    if (typeof value === "string" || typeof value === "number") {
      const text = String(value).trim();
      return text || null;
    }
    return null;
  }

  function verificationValue(...keys: string[]): string | null {
    const nested =
      verification &&
      typeof verification.customer === "object" &&
      verification.customer !== null
        ? (verification.customer as Record<string, unknown>)
        : null;
    for (const key of keys) {
      const value =
        verificationText(verification?.[key]) ??
        verificationText(nested?.[key]);
      if (value) return value;
    }
    return null;
  }

  function verificationDetails(): Array<[string, string]> {
    if (!verification) return [];
    const details: Array<[string, string]> = [];
    const candidates: Array<[string, string[]]> =
      category === "CABLE"
        ? [
            ["Customer name", ["customerName", "name", "customer_name"]],
            [
              "Current bouquet",
              ["currentBouquet", "current_bouquet", "bouquet", "package"],
            ],
            ["Status", ["status", "customerStatus", "customer_status"]],
            [
              "Due date",
              ["dueDate", "due_date", "renewalDate", "renewal_date"],
            ],
            ["Address", ["address", "customerAddress", "customer_address"]],
          ]
        : [
            ["Customer name", ["customerName", "name", "customer_name"]],
            ["Meter type", ["meterType", "meter_type"]],
            ["Address", ["address", "customerAddress", "customer_address"]],
            ["Status", ["status", "customerStatus", "customer_status"]],
          ];

    for (const [label, keys] of candidates) {
      const value = verificationValue(...(keys as string[]));
      if (value) details.push([label, value]);
    }
    return details;
  }

  async function openReview(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setStatus("");
    if (!hasPin) {
      setMessage(
        "Set your transaction PIN in Security before making a purchase.",
      );
      return;
    }
    if (!validate()) return;

    if (category === "CABLE" || category === "ELECTRICITY") {
      if (!customerVerificationKey) return;
      if (verifiedKey === customerVerificationKey && verification) {
        setReview(true);
        return;
      }

      setVerificationLoading(true);
      setVerification(null);
      setVerifiedKey(null);
      try {
        const serviceData: Record<string, string> =
          category === "CABLE"
            ? {
                cableTv: network,
                smartCardNo: accountNumber.trim(),
              }
            : {
                electricCompany: network,
                meterNo: accountNumber.trim(),
                meterType,
              };

        const result = await verifyCustomer({
          category,
          networkProvider: network,
          planId: category === "ELECTRICITY" ? "AMOUNT" : planId,
          serviceData,
        });

        if (result.verified === false) {
          throw new ApiError(
            "Customer verification failed.",
            422,
            "CUSTOMER_VERIFICATION_FAILED",
          );
        }

        setVerification(result);
        setVerifiedKey(customerVerificationKey);
        setMessage(
          "Customer details verified. You can now review the purchase.",
        );
      } catch (error) {
        const code = error instanceof ApiError ? error.code : undefined;
        if (code === "CUSTOMER_VERIFICATION_FAILED") {
          setMessage(
            "We couldn't verify these customer details. Please check the customer number and service provider, then try again.",
          );
        } else if (code === "PROVIDER_VERIFICATION_UNAVAILABLE") {
          setMessage(
            "Customer verification is temporarily unavailable. Please try again shortly.",
          );
        } else {
          setMessage(
            customerMessage(
              error,
              "We couldn't verify this customer right now. Please check the details and try again.",
            ),
          );
        }
      } finally {
        setVerificationLoading(false);
      }
      return;
    }

    setReview(true);
  }

  async function confirmPurchase() {
    if (!/^\d{4}$/.test(pin)) {
      setMessage("Enter your 4-digit transaction PIN.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const serviceData: Record<string, unknown> = {};

      if (category === "CABLE") {
        serviceData.cableTv = network;
        serviceData.smartCardNo = accountNumber.trim();
        serviceData.subscriptionType = subscriptionType;
      }

      if (category === "ELECTRICITY") {
        serviceData.electricCompany = network;
        serviceData.meterNo = accountNumber.trim();
        serviceData.meterType = meterType;
      }

      if (isJambRegistration) {
        serviceData.profileCode = jambProfileCode;
        serviceData.email = jambEmail.trim();
      }

      if (!dynamic && selected?.supportsBulk) {
        serviceData.quantity = quantity;
      }

      const result = await purchase({
        planId: dynamic ? "AMOUNT" : planId,
        ...(dynamic ? { amount: amountValue } : {}),
        networkProvider: network,
        // The backend currently requires a phone field on every vending request.
        // For services that are not phone-delivered, this is the authenticated
        // account phone, not a beneficiary/delivery number.
        phone: needsBeneficiaryPhone ? beneficiaryPhone.trim() : profilePhone,
        txnPin: pin,
        category,
        serviceData,
      }, getOrCreateActionIdempotencyKey("purchase"));

      setPurchaseResult(result);
      setStatus(result.status);
      clearActionIdempotencyKey("purchase");
      setMessage("");
      setVerificationRequired(false);
      setPin("");
      setReview(false);
    } catch (error) {
      const code = error instanceof ApiError ? error.code : undefined;

      // A deterministic rejection means this is a new purchase attempt
      // (for example an invalid PIN, insufficient funds, validation error,
      // or idempotency conflict). Discard the old key so corrected input
      // receives a fresh idempotency key.
      //
      // Keep the key for 425/5xx/network failures because the outcome may
      // be uncertain and retrying must remain idempotent.
      if (
        error instanceof ApiError &&
        error.status >= 400 &&
        error.status < 500 &&
        error.status !== 425
      ) {
        clearActionIdempotencyKey("purchase");
      }

      setVerificationRequired(code === "EMAIL_VERIFICATION_REQUIRED");
      setMessage(
        customerMessage(
          error,
          "We couldn't complete this purchase right now. Please try again shortly.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  if (publicMode && authenticated === false) {
    return (
      <Card className="mx-auto w-full min-w-0 max-w-5xl rounded-2xl">
        <CardHeader>
          <Badge className="w-fit bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
            Purchase requires authentication
          </Badge>
          <CardTitle className="text-2xl">Choose your provider</CardTitle>
          <p className="text-muted-foreground">
            Choose the option you want. Sign in or create an account to see what is currently available and complete the purchase.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {providerOptions.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setNetwork(value)}
                disabled={lockSelection}
                className={`rounded-2xl border p-4 text-left text-sm font-semibold transition ${network === value ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/10" : "hover:bg-muted"}`}
              >
                <span className="flex items-center gap-3">
                  <img
                    src={providerImages[value]}
                    alt=""
                    aria-hidden="true"
                    className="size-8 shrink-0 object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  <span>{label}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border bg-muted/40 p-5 text-sm text-muted-foreground">
            <ShieldCheck className="mb-3 size-5 text-emerald-500" />
            Your selected provider is{" "}
            <span className="font-semibold text-foreground">
              {providerOptions.find(([value]) => value === network)?.[1] ||
                network}
            </span>
            . No wallet debit or provider purchase can start until you
            authenticate.
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              render={
                <Link
                  href={`/sign-up?redirect=${encodeURIComponent(redirectPath)}`}
                />
              }
            >
              Create account
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              render={
                <Link
                  href={`/sign-in?redirect=${encodeURIComponent(redirectPath)}`}
                />
              }
            >
              Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (authenticated === null) {
    return (
      <Card className="mx-auto w-full min-w-0 max-w-5xl rounded-2xl">
        <CardContent className="flex items-center gap-3 p-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Checking your TEKSUM session…
        </CardContent>
      </Card>
    );
  }

  const providerLabel =
    providerOptions.find(([value]) => value === network)?.[1] || network;

  const customerVerified =
    (category === "CABLE" || category === "ELECTRICITY") &&
    Boolean(verification && verifiedKey === customerVerificationKey);

  const reviewDetails: Array<[string, string]> = [
    ["Service", title],
    ["Provider", providerLabel],
    [
      dynamic ? "Amount" : "Plan",
      dynamic ? formatNaira(amountValue) : selected?.planName || "—",
    ],
  ];

  if (needsBeneficiaryPhone) {
    reviewDetails.push(["Beneficiary phone", beneficiaryPhone]);
  }
  if (category === "CABLE") {
    reviewDetails.push(["Smart card", accountNumber]);
    reviewDetails.push([
      "Subscription",
      subscriptionType === "renew" ? "Renew" : "Change package",
    ]);
  }
  if (category === "ELECTRICITY") {
    reviewDetails.push(["Meter number", accountNumber]);
    reviewDetails.push([
      "Meter type",
      meterType === "prepaid" ? "Prepaid" : "Postpaid",
    ]);
  }
  if (isJambRegistration) {
    reviewDetails.push(["JAMB profile code", jambProfileCode]);
    reviewDetails.push(["Email", jambEmail]);
  }
  if (!needsBeneficiaryPhone && category === "EDUCATION_PIN") {
    reviewDetails.push([
      "Delivery",
      "Delivered securely after a successful purchase",
    ]);
  }
  if (!needsBeneficiaryPhone && category === "AIRTIME_PIN") {
    reviewDetails.push([
      "Delivery",
      "PIN returned securely in the transaction details",
    ]);
  }
  reviewDetails.push([
    "Quantity",
    !dynamic && selected?.supportsBulk ? String(quantity) : "1",
  ]);
  reviewDetails.push(["Total", estimatedTotal === null ? "—" : formatNaira(estimatedTotal)]);

  return (
    <Card className="mx-auto w-full min-w-0 max-w-5xl rounded-2xl shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              Secure checkout
            </Badge>
            <CardTitle className="text-2xl tracking-tight">
              {review
                ? "Review your purchase"
                : category === "CABLE" || category === "ELECTRICITY"
                  ? "Verify customer details"
                  : title}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {review
                ? "Please review your details and enter your transaction PIN to continue."
                : description}
            </p>
          </div>
          <ShieldCheck className="size-5 shrink-0 text-emerald-500" />
        </div>
      </CardHeader>
      <CardContent>
        <CustomerFeedback
          message={message}
          loading={loading}
          loadingTitle="Processing your purchase…"
          loadingMessage="Your request has been submitted and is being processed. Please wait and do not close or refresh this page."
          action={
            verificationRequired ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="pointer-events-auto gap-1.5"
                render={<Link href={`/verify-email?email=${encodeURIComponent(profileEmail || "")}&redirect=${encodeURIComponent(pathname || "/dashboard")}`} />}
              >
                <MailCheck className="size-3.5" />
                Verify email
              </Button>
            ) : null
          }
        />
        {purchaseResult ? (
          <PurchaseResultView
            result={purchaseResult}
            title={title}
            planName={dynamic ? "Amount-based service" : selected?.planName || "Selected service"}
            amount={estimatedTotal ?? 0}
            beneficiary={
              needsBeneficiaryPhone
                ? maskSensitiveIdentifier(beneficiaryPhone)
                : category === "CABLE" || category === "ELECTRICITY"
                  ? maskSensitiveIdentifier(accountNumber)
                  : ""
            }
          />
        ) : !review ? (
          <form onSubmit={openReview} className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium">
                {category === "CABLE" || category === "ELECTRICITY"
                  ? "Provider"
                  : category === "EDUCATION_PIN"
                    ? "Exam provider"
                    : "Network"}
              </p>
              <div
                className={`grid gap-3 ${providerOptions.length > 4 ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}
              >
                {providerOptions.map(([value, label]) =>
                  category === "EDUCATION_PIN" && lockSelection ? (
                    <Link
                      key={value}
                      href={educationProviderHref(value)}
                      aria-current={network === value ? "page" : undefined}
                      className={`rounded-2xl border p-3 text-sm font-semibold transition ${network === value ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/10" : "hover:bg-muted"}`}
                    >
                      <span className="flex items-center gap-3">
                        <img
                          src={providerImages[value]}
                          alt=""
                          aria-hidden="true"
                          className="size-8 shrink-0 object-contain"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                        <span>{label}</span>
                      </span>
                    </Link>
                  ) : (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setNetwork(value)}
                      disabled={lockSelection}
                      className={`rounded-2xl border p-3 text-sm font-semibold transition ${network === value ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/10" : "hover:bg-muted"}`}
                    >
                      <span className="flex items-center gap-3">
                        <img
                          src={providerImages[value]}
                          alt=""
                          aria-hidden="true"
                          className="size-8 shrink-0 object-contain"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                        <span>{label}</span>
                      </span>
                    </button>
                  ),
                )}
              </div>
            </div>

            {category === "EDUCATION_PIN" && fixedPlanId ? (
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Selected product
                </p>
                <p className="mt-1 font-semibold">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This product has a specific purchase option. Only the matching option can be selected.
                </p>
              </div>
            ) : category === "EDUCATION_PIN" && capabilities.length > 0 ? (
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-sm font-semibold">Supported products</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {capabilities
                    .flatMap((capability) => {
                      const item = capability as {
                        services?: Array<{ products?: unknown[] }>;
                      };
                      return item.services || [];
                    })
                    .flatMap((service) => service.products || [])
                    .map((product, index) => {
                      const item = product as { name?: string };
                      return (
                        <Badge
                          key={`${item.name || "product"}-${index}`}
                          variant="secondary"
                        >
                          {item.name || "Supported product"}
                        </Badge>
                      );
                    })}
                </div>
              </div>
            ) : null}

            {!dynamic && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Available plans
                </label>
                <select
                  disabled={
                    loadingPlans || Boolean(fixedPlanId) || lockSelection
                  }
                  value={planId}
                  onChange={(event) => setPlanId(event.target.value)}
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                >
                  <option value="">
                    {loadingPlans ? "Loading available plans…" : "Select a plan"}
                  </option>
                  {plans.map((plan) => (
                    <option key={plan.planId} value={plan.planId}>
                      {plan.planName} — {formatNaira(plan.sellingPrice)}
                    </option>
                  ))}
                </select>
                {!loadingPlans && plans.length === 0 && (
                  <p className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
                    No plans are available for this option right now. Please choose another option or try again later.
                  </p>
                )}
              </div>
            )}

            {dynamic && (
              <div>
                <label className="mb-2 block text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  min={dynamicMin}
                  max={dynamicMax}
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Enter amount"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Allowed range: {formatNaira(dynamicMin)} –{" "}
                  {formatNaira(dynamicMax)}
                  {rule?.description ? ` • ${rule.description}` : ""}
                </p>
              </div>
            )}

            {!dynamic && selected?.supportsBulk && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={selected.minQuantity}
                    max={selected.maxQuantity}
                    step="1"
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(Number(event.target.value))
                    }
                  />
                  <Badge variant="secondary">Bulk purchase</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  This product supports {selected.minQuantity}–
                  {selected.maxQuantity} units per transaction.
                </p>
              </div>
            )}

            {needsBeneficiaryPhone && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Beneficiary phone number
                </label>
                <Input
                  value={beneficiaryPhone}
                  onChange={(event) =>
                    setBeneficiaryPhone(
                      event.target.value.replace(/[^\d+]/g, ""),
                    )
                  }
                  placeholder="08012345678"
                  inputMode="tel"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  This is the Nigerian phone line that will receive the{" "}
                  {category === "AIRTIME" ? "airtime" : "data"}.
                </p>
              </div>
            )}

            {category === "CABLE" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Smart card number
                  </label>
                  <Input
                    value={accountNumber}
                    onChange={(event) =>
                      setAccountNumber(event.target.value.replace(/\s/g, ""))
                    }
                    placeholder="Enter smart card number"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Subscription action
                  </label>
                  <select
                    value={subscriptionType}
                    onChange={(event) =>
                      setSubscriptionType(
                        event.target.value as "renew" | "change",
                      )
                    }
                    className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  >
                    <option value="renew">Renew subscription</option>
                    <option value="change">Change package</option>
                  </select>
                </div>
              </div>
            )}

            {category === "ELECTRICITY" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Meter number
                  </label>
                  <Input
                    value={accountNumber}
                    onChange={(event) =>
                      setAccountNumber(event.target.value.replace(/\s/g, ""))
                    }
                    placeholder="Enter meter number"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Meter type
                  </label>
                  <select
                    value={meterType}
                    onChange={(event) => setMeterType(event.target.value)}
                    className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  >
                    <option value="prepaid">Prepaid</option>
                    <option value="postpaid">Postpaid</option>
                  </select>
                </div>
              </div>
            )}

            {isJambRegistration && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    JAMB profile code
                  </label>
                  <Input
                    inputMode="numeric"
                    value={jambProfileCode}
                    onChange={(event) =>
                      setJambProfileCode(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Profile code"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={jambEmail}
                    onChange={(event) => setJambEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            )}

            {category === "EDUCATION_PIN" && (
              <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">
                  {isJambRegistration ? "JAMB PIN delivery" : "Digital delivery"}
                </p>
                <p className="mt-1">
                  {isJambRegistration
                    ? "Your JAMB registration PIN is sent to the email and phone number on your TEKSUM account. When the provider returns the PIN to TEKSUM, it is also stored securely in your transaction details."
                    : "Your education PIN or token is returned securely after a successful purchase and can be viewed in your transaction details."}
                </p>
              </div>
            )}

            {category === "AIRTIME_PIN" && (
              <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">
                  Recharge-card PIN delivery
                </p>
                <p className="mt-1">
                  No beneficiary phone number is required. The purchased PIN is
                  returned securely with the transaction.
                </p>
              </div>
            )}

            {customerVerified && verification && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[.06] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="font-semibold">Customer details verified</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your customer details have been verified. Verification does not charge your wallet or complete a purchase.
                    </p>
                    {verificationDetails().length > 0 && (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {verificationDetails().map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-xl border bg-background/60 p-3"
                          >
                            <p className="text-[11px] text-muted-foreground">
                              {label}
                            </p>
                            <p className="mt-1 break-words text-sm font-semibold">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 rounded-2xl bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Estimated total</p>
                <p className="text-xl font-black">
                  {estimatedTotal === null ? "—" : formatNaira(estimatedTotal)}
                </p>
              </div>
              <Button
                type="submit"
                disabled={
                  loadingPlans || verificationLoading || (!dynamic && !selected)
                }
                size="lg"
                className="w-full shrink-0 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
              >
                {verificationLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Verifying customer...
                  </>
                ) : category === "CABLE" || category === "ELECTRICITY" ? (
                  customerVerified ? (
                    "Review purchase"
                  ) : (
                    "Verify customer"
                  )
                ) : (
                  "Review purchase"
                )}
              </Button>
            </div>

          </form>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {reviewDetails.map(([label, value]) => (
                <div key={label} className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 break-words font-semibold">{value}</p>
                </div>
              ))}
            </div>

            {(category === "CABLE" || category === "ELECTRICITY") &&
              verification && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[.06] p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                    <div className="min-w-0">
                      <p className="font-semibold">Customer details verified</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        These customer details have been confirmed. Verification only checks the details; it does not charge your wallet or complete a purchase.
                      </p>
                      {verificationDetails().length > 0 && (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {verificationDetails().map(([label, value]) => (
                            <div
                              key={label}
                              className="rounded-xl border bg-background/60 p-3"
                            >
                              <p className="text-[11px] text-muted-foreground">
                                {label}
                              </p>
                              <p className="mt-1 break-words text-sm font-semibold">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[.05] p-4">
              <p className="text-sm font-semibold">Transaction PIN</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your 4-digit PIN is used only for this secure purchase request.
              </p>
              <Input
                className="mt-3 max-w-xs"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={4}
                type="password"
                value={pin}
                onChange={(event) =>
                  setPin(event.target.value.replace(/\D/g, ""))
                }
                placeholder="••••"
              />
            </div>


            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => {
                  setReview(false);
                  setPin("");
                }}
              >
                Back
              </Button>
              <Button
                type="button"
                disabled={loading || pin.length !== 4}
                onClick={confirmPurchase}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {loading ? (
                  <Loader2 className="animate-spin" aria-label="Processing" />
                ) : (
                  "Confirm & purchase"
                )}
              </Button>
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
