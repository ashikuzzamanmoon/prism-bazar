import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/Provider/Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Prism Bazar Admin",
    template: "%s | Prism Bazar Admin",
  },
  description: "Prism Bazar Admin Portal - Organic Food & Education Materials",
  icons: {
    icon: [
      { url: "/prism-bazar-icon.png", type: "image/png" },
      { url: "/prism-bazar-icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/prism-bazar-icon.png",
    apple: "/prism-bazar-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
