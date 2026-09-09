import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "OTERIHACK RUMP",
  description: "Planning des RUMPs hebdomadaires OteriHack — tous les jeudis de 18h à 19h.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-ink">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
