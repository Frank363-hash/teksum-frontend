import { NextRequest } from "next/server";
const BACKEND = process.env.TEKSUM_API_URL;

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const cleanPath = path.join("/");

  if (!BACKEND) {
    console.error("TEKSUM_API_URL is not configured.");
    return Response.json(
      {
        success: false,
        error: {
          code: "MISCONFIGURED",
          message: "Backend URL is not configured.",
        },
      },
      { status: 500 },
    );
  }

  // Customer routes are mounted at the backend root; admin routes are mounted
  // under /api/v1/admin. The proxy preserves those backend paths exactly.
  const upstream = `${BACKEND.replace(/\/$/, "")}/${cleanPath}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  if (cleanPath.startsWith("api/v1/admin")) {
    if (!process.env.TEKSUM_ADMIN_SECRET) {
      console.error(
        "TEKSUM_ADMIN_SECRET is not configured; admin requests will be rejected by the backend.",
      );
    } else {
      headers.set("x-admin-secret", process.env.TEKSUM_ADMIN_SECRET);
    }
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    cache: "no-store",
    credentials: "include",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  try {
    const response = await fetch(upstream, init);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("TEKSUM proxy request failed:", error);
    return Response.json(
      {
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "TEKSUM service is unavailable. Please try again shortly.",
        },
      },
      { status: 503 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
