import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.teksum.org"),
  title: {
    default: "TEKSUM Data, Airtime, Bills & Exam PINs",
    template: "%s | TEKSUM",
  },
  description:
    "Buy data, airtime, exam PINs and supported Nigerian bills through TEKSUM.",
  applicationName: "TEKSUM",
  keywords: [
    "TEKSUM",
    "Nigerian VTU",
    "data bundles",
    "airtime",
    "exam PINs",
    "electricity bills",
    "cable TV",
    "digital services Nigeria",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TEKSUM Data, Airtime, Bills & Exam PINs",
    description:
      "Buy data, airtime, exam PINs and supported Nigerian bills through TEKSUM.",
    type: "website",
    url: "https://www.teksum.org/",
    siteName: "TEKSUM",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "TEKSUM Data, Airtime, Bills & Exam PINs",
    description:
      "Buy data, airtime, exam PINs and supported Nigerian bills through TEKSUM.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
