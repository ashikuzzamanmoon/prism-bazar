import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import { ReduxProvider } from "@/redux/provider";
import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, siteConfig } from "@/lib/seo/site";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo/schema";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...buildMetadata({
    title: "খাঁটি অর্গানিক খাদ্য ও শিক্ষণ সামগ্রী",
    description:
      "সিরাজগঞ্জ ও কাজীপুরসহ সারাদেশে খাঁটি অর্গানিক খাদ্য সামগ্রী এবং শিক্ষার্থীদের স্টাডি মেটেরিয়ালস ও ডিজিটাল শিট সরবরাহকারী বিশ্বস্ত প্ল্যাটফর্ম।",
    path: "/",
  }),
  title: {
    default: `${siteConfig.name} | খাঁটি অর্গানিক খাদ্য ও শিক্ষণ সামগ্রী`,
    template: "%s | Prism Bazar",
  },
  icons: {
    icon: "/prism-bazar-icon.svg",
    shortcut: "/prism-bazar-icon.svg",
    apple: "/prism-bazar-icon.svg",
  },
  authors: [{ name: "Prism Bazar Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href={siteConfig.domain} />
        <link rel="dns-prefetch" href={siteConfig.domain} />
        {/* Meta Pixel Code */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '736870099420880');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <GoogleTagManager gtmId="GTM-K4HP7LCD" />
      <body
        className={`${montserrat.variable} ${geistMono.variable} antialiased`}
      >
        <JsonLd data={buildOrganizationSchema()} />
        <JsonLd data={buildWebsiteSchema()} />
        <ReduxProvider>{children}</ReduxProvider>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=736870099420880&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
