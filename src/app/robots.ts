import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/admin/",
        "/api/",
        "/mfa",
        "/sign-in",
        "/sign-up",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/settings",
      ],
    },
    sitemap: "https://teksum.ng/sitemap.xml",
    host: "https://teksum.ng",
  };
}
