import type { MetadataRoute } from "next";

const baseUrl = "https://www.teksum.org";

const publicRoutes = [
  "/",
  "/services",
  "/services/data",
  "/services/airtime",
  "/services/education",
  "/services/cable",
  "/services/power",
  "/services/airtime-pin",
  "/services/international-airtime",
  "/services/cable/dstv",
  "/services/cable/gotv",
  "/services/cable/startimes",
  "/services/cable/showmax",
  "/services/education/waec",
  "/services/education/neco",
  "/services/education/nabteb",
  "/services/education/jamb",
  "/pricing",
  "/about",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/wallet-terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === "/" || path === "/services" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/services" ? 0.9 : 0.7,
  }));
}
