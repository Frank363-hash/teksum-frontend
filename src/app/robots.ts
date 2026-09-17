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
    sitemap: "https://www.teksum.org/sitemap.xml",
    host: "https://www.teksum.org",
  };
}
