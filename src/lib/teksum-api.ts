export type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export class ApiError extends Error {
  readonly code?: string;
  readonly status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function isRateLimitedError(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.status === 429 || error.code === "RATE_LIMITED")
  );
}

export function isAuthenticationError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export const API_BASE = "/api/teksum";

export function idempotencyKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return `teksum-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getOrCreateActionIdempotencyKey(scope: string) {
  if (typeof window === "undefined") return idempotencyKey();
  const storageKey = `teksum-idempotency:${scope}`;
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;
  const created = idempotencyKey();
  sessionStorage.setItem(storageKey, created);
  return created;
}

export function clearActionIdempotencyKey(scope: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`teksum-idempotency:${scope}`);
}

export async function clearSession() {
  await fetch("/api/session", {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
  });
}

export function formatNaira(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "₦0.00";
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(value: unknown) {
  const d = new Date(String(value));
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}

export function customerMessage(
  error: unknown,
  fallback = "Something went wrong.",
) {
  const raw = error instanceof Error ? error.message : String(error || "");
  if (!raw || /<!doctype|<html/i.test(raw)) return fallback;
  const value = raw.trim();
  const map: Array<[RegExp, string]> = [
    [
      /INSUFFICIENT_FUNDS|Insufficient wallet balance/i,
      "Your wallet balance isn't enough to complete this transaction.",
    ],
    [/INVALID_PIN/i, "That PIN isn't right. Try again."],
    [
      /PIN_LOCKED/i,
      "Your transaction PIN is temporarily locked. Please try again later.",
    ],
    [/INVALID_AMOUNT/i, "That amount is outside the allowed range."],
    [
      /INVALID_PLAN|INVALID_PRICING_PLAN|INVALID_PRICING_RULE/i,
      "That service option is no longer available. Please choose another option.",
    ],
    [
      /INVALID_SERVICE_DETAILS/i,
      "Check the details you entered and try again.",
    ],
    [
      /EMAIL_VERIFICATION_REQUIRED/i,
      "Please verify your email before using wallet and purchase services.",
    ],
    [
      /ADMIN_MFA_REQUIRED/i,
      "Administrator two-factor authentication must be enabled before using admin tools.",
    ],
    [/ADMIN_FORBIDDEN/i, "You don't have permission to use this area."],
    [
      /RATE_LIMITED|Too many requests|rate limit/i,
      "Too many requests. Please wait a moment and try again.",
    ],
    [
      /SERVICE_UNAVAILABLE|ECONNREFUSED|fetch failed|Failed to fetch|Request failed/i,
      "We're having trouble completing this right now. Please try again shortly.",
    ],
    [
      /PENDING|pending reconciliation|still pending|still being confirmed/i,
      "We're still confirming this transaction. Check Transactions for the latest status.",
    ],
  ];
  for (const [pattern, message] of map) if (pattern.test(value)) return message;

  // Never expose engineering, infrastructure, provider-integration, or raw server
  // errors to customers. Preserve only messages that are clearly human-facing.
  const technical = /backend|api(?:\s|[-_]?key|\s+error)?|axios|fetch(?:ed|ing)?|failed to fetch|request failed|cannot (?:get|post|put|patch|delete)|prisma|database|sql|query|endpoint|upstream|downstream|stack trace|exception|internal(?:\s|_)?error|server error|servicecategory|networkprovider|pricingplan|idempotency|fulfilment|fulfillment|adapter|mapping|capabilit(?:y|ies)|variation|configured|misconfigured|unauthorized|forbidden|ec2|econnrefused/i;
  if (technical.test(value) || value.length > 220) return fallback;

  return value.slice(0, 220) || fallback;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: {
    auth?: boolean;
    idempotent?: boolean;
    idempotencyKey?: string;
    redirectOn401?: boolean;
  } = {},
) {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body)
    headers.set("Content-Type", "application/json");
  if (options.idempotent) {
    const key = options.idempotencyKey ?? idempotencyKey();
    headers.set("X-Idempotency-Key", key);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  let body: ApiEnvelope<T> | null = null;
  try {
    body = await response.json();
  } catch {
    /* handled below */
  }

  if (response.status === 429) {
    if (body && body.success === false) {
      throw new ApiError(body.error.message, 429, body.error.code || "RATE_LIMITED");
    }
    throw new ApiError(
      "Too many requests. Please wait a moment and try again.",
      429,
      "RATE_LIMITED",
    );
  }

  if (
    response.status === 401 &&
    typeof window !== "undefined" &&
    options.auth !== false &&
    options.redirectOn401 !== false
  ) {
    const currentPath = window.location.pathname;
    const alreadyOnAuthPage = ["/sign-in", "/login", "/mfa"].some(
      (path) => currentPath === path || currentPath.startsWith(`${path}/`),
    );

    if (
      !alreadyOnAuthPage &&
      !sessionStorage.getItem("teksum-auth-redirecting")
    ) {
      sessionStorage.setItem("teksum-auth-redirecting", "1");
      await clearSession().catch(() => {});
      const next = `${currentPath}${window.location.search}`;
      window.location.replace(`/sign-in?redirect=${encodeURIComponent(next)}`);
    }
    throw new Error("Session expired");
  }
  if (!response.ok || !body || body.success === false) {
    if (body && body.success === false) {
      throw new ApiError(body.error.message, response.status, body.error.code);
    }
    throw new ApiError("Request failed", response.status);
  }
  return body.data;
}

export type Plan = {
  serviceCategory: string;
  networkProvider: string;
  planId: string;
  planName: string;
  productType: string;
  sellingPrice: string;
  isActive: boolean;
  supportsBulk: boolean;
  minQuantity: number;
  maxQuantity: number;
  description: string | null;
};

export type SmsQuote = {
  eligible: boolean;
  estimatedSegments: number;
  smsFee: string;
  currency: string;
};

export const getSmsQuote = (input: {
  planId: string;
  networkProvider: string;
  category: string;
  quantity?: number;
}) => {
  const params = new URLSearchParams({
    planId: input.planId,
    networkProvider: input.networkProvider,
    category: input.category,
    quantity: String(input.quantity ?? 1),
  });
  return apiFetch<SmsQuote>(`/vending/sms/quote?${params}`);
};

export const getPlans = (category?: string, network?: string) => {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (network) params.set("networkProvider", network);
  return apiFetch<Plan[]>(`/vending/catalog${params.size ? `?${params}` : ""}`);
};

export type PublicService = {
  code: string;
  name: string;
  available: boolean;
  comingSoon?: boolean;
  products?: string[];
};
export const getPublicServices = () =>
  apiFetch<{ services: PublicService[] }>(
    "/public/services",
    {},
    { auth: false },
  );
export type ElectricityCapability = {
  code: string;
  name: string;
  minAmount: string;
  maxAmount: string;
};

export type ElectricityCapabilitiesResponse = {
  capabilities: {
    ELECTRICITY: ElectricityCapability[];
  };
};

export type GeneralCapabilitiesResponse = {
  capabilities: unknown[];
};

export function getCapabilities(
  category: "ELECTRICITY",
): Promise<ElectricityCapabilitiesResponse>;
export function getCapabilities(
  category?: string,
): Promise<GeneralCapabilitiesResponse>;
export function getCapabilities(category?: string) {
  return apiFetch<
    ElectricityCapabilitiesResponse | GeneralCapabilitiesResponse
  >(
    `/vending/capabilities${category ? `?category=${encodeURIComponent(category)}` : ""}`,
  );
}
export type CustomerVerificationResult = Record<string, unknown>;

export const verifyCustomer = (input: {
  category: "CABLE" | "ELECTRICITY";
  networkProvider: string;
  planId: string;
  serviceData: Record<string, string>;
}) =>
  apiFetch<CustomerVerificationResult>("/vending/customer/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getPricingRules = (category?: string, network?: string) => {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (network) params.set("networkProvider", network);
  return apiFetch<
    Array<{
      id: string;
      serviceCategory: string;
      networkProvider: string;
      minAmount: string;
      maxAmount: string;
      fixedFee: string;
      markupPercent: string;
      description: string | null;
    }>
  >(`/vending/pricing/rules${params.size ? `?${params}` : ""}`);
};

export type Profile = {
  id: string;
  email: string;
  phone: string;
  fullName: string | null;
  role: string;
  status: string;
  isVerified: boolean;
  emailVerifiedAt: string | null;
  mfaEnabled: boolean;
  createdAt: string;
  hasTransactionPin: boolean;
};
let profileInFlight: Promise<Profile> | null = null;

export const getProfile = (options: { redirectOn401?: boolean } = {}) => {
  if (profileInFlight) return profileInFlight;

  profileInFlight = apiFetch<Profile>("/me", {}, options).finally(() => {
    profileInFlight = null;
  });

  return profileInFlight;
};
export const updateName = (fullName: string) =>
  apiFetch<{ id: string; fullName: string }>("/me/name", {
    method: "PATCH",
    body: JSON.stringify({ fullName }),
  });
export const getSecurity = () =>
  apiFetch<{
    emailVerified: boolean;
    emailVerifiedAt: string | null;
    twoFactorEnabled: boolean;
    transactionPinSet: boolean;
  }>("/me/security");

export type Transaction = {
  id: string;
  reference: string;
  type: string;
  category: string;
  amount: string;
  fee: string;
  status: string;
  providerName: string | null;
  providerRef: string | null;
  createdAt: string;
};
export const getWallet = () =>
  apiFetch<{ balance: string; ledgerBalance?: string }>("/wallet");

export type FundingAccount = {
  status: string;
  accountNumber: string | null;
  accountName: string | null;
  bankName: string | null;
  bankSlug: string | null;
  currency: string | null;
};

export const getFundingAccount = () =>
  apiFetch<FundingAccount>("/wallet/funding/account");

export const reconcileFunding = () =>
  apiFetch<{
    status: "NOT_READY" | "CHECKED";
    requeryRequested: boolean;
    credited: Array<{ reference: string; amount: number }>;
  }>("/wallet/funding/reconcile", { method: "POST" });
export const recordDvaConsent = () =>
  apiFetch<{
    consented: true;
    consentId: string;
    consentType: string;
    termsVersion: string;
    privacyVersion: string;
    consentedAt: string;
    source: string;
  }>("/wallet/funding/consent", {
    method: "POST",
    body: JSON.stringify({ consent: true }),
  });
export const getTransactions = (query = "") =>
  apiFetch<{
    items: Transaction[];
    pagination: { page: number; pages: number; total: number };
  }>(`/transactions${query ? `?${query}` : ""}`);

export async function purchase(
  payload: Record<string, unknown>,
  requestIdempotencyKey?: string,
) {
  return apiFetch<{
    status: string;
    reference?: string;
    transactionId?: string;
    message?: string;
    fulfillment?: unknown;
  }>(
    "/vending/purchase",
    { method: "POST", body: JSON.stringify(payload) },
    { idempotent: true, idempotencyKey: requestIdempotencyKey },
  );
}

export const initializeFunding = (amount: number, requestIdempotencyKey?: string) =>
  apiFetch<{
    transactionId: string;
    reference: string;
    status: string;
    checkoutUrl?: string;
    provider?: string;
  }>(
    "/wallet/funding/initialize",
    { method: "POST", body: JSON.stringify({ amount }) },
    { idempotent: true, idempotencyKey: requestIdempotencyKey },
  );
export const verifyFunding = (reference: string) =>
  apiFetch<{ transactionId: string; reference: string; status: string }>(
    "/wallet/funding/verify",
    { method: "POST", body: JSON.stringify({ reference }) },
  );

export type WithdrawalBank = { name: string; code: string };
export type ResolvedWithdrawalAccount = {
  accountName: string;
  accountNumber: string;
  bankCode: string;
};

export const getWithdrawalBanks = () =>
  apiFetch<WithdrawalBank[]>("/withdrawal/banks");

export const verifyWithdrawalAccount = (
  accountNumber: string,
  bankCode: string,
) =>
  apiFetch<ResolvedWithdrawalAccount>("/withdrawal/verify-account", {
    method: "POST",
    body: JSON.stringify({ accountNumber, bankCode }),
  });

export type WithdrawalQuote = {
  amount: string;
  fee: string;
  payoutAmount: string;
  walletBalance: string;
  walletBalanceAfter: string;
  minimumWithdrawal: string;
  maximumWithdrawal: string | null;
  dailyWithdrawalLimit: string;
  dailyUsed: string;
  dailyRemaining: string;
  feePercent: string;
  feeMinimum: string;
  currency: "NGN";
  canWithdraw: boolean;
  reasons: string[];
};

export const quoteWithdrawal = (amount: number) =>
  apiFetch<WithdrawalQuote>("/withdrawal/quote", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

export const withdrawFunds = (
  payload: {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  txnPin: string;
  },
  requestIdempotencyKey?: string,
) =>
  apiFetch<{
    transactionId: string;
    reference: string;
    status: string;
  }>(
    "/withdrawal/transfer",
    { method: "POST", body: JSON.stringify(payload) },
    { idempotent: true, idempotencyKey: requestIdempotencyKey },
  );

export const changePassword = (payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) =>
  apiFetch<{ message: string }>("/auth/password/change", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const setPin = (txnPin: string, currentTxnPin?: string) =>
  apiFetch<{ message: string }>("/auth/pin", {
    method: "POST",
    body: JSON.stringify({
      txnPin,
      ...(currentTxnPin ? { currentTxnPin } : {}),
    }),
  });
export const requestPinReset = () =>
  apiFetch<{ message: string }>("/auth/pin/forgot", {
    method: "POST",
    body: JSON.stringify({}),
  });
export const resetPin = (code: string, txnPin: string) =>
  apiFetch<{ message: string }>("/auth/pin/reset", {
    method: "POST",
    body: JSON.stringify({ code, txnPin }),
  });
export const setupMfa = () =>
  apiFetch<{ secret: string; otpauthUri: string }>("/auth/mfa/setup", {
    method: "POST",
    body: JSON.stringify({}),
  });
export const enableMfa = (code: string) =>
  apiFetch<{ enabled: boolean; recoveryCodes?: string[] }>("/auth/mfa/enable", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
export const disableMfa = (password: string, code: string) =>
  apiFetch<{ message: string }>("/auth/mfa/disable", {
    method: "POST",
    body: JSON.stringify({ password, code }),
  });

export const deleteAccount = (currentPassword: string, confirmation: "DELETE", mfaCode?: string) =>
  apiFetch<{ message: string }>("/auth/account", {
    method: "DELETE",
    body: JSON.stringify({ currentPassword, confirmation, ...(mfaCode ? { mfaCode } : {}) }),
  });

export const logout = async () => {
  try {
    await apiFetch("/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
    });
  } finally {
    await clearSession();
  }
};
