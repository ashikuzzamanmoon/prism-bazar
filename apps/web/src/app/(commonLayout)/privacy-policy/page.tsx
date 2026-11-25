import React from "react";
import type { Metadata } from "next";
import { Shield, Eye, Lock, FileText, Mail, Info, Database, UserCheck, Cookie } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Prism Bazar",
  description: "Our privacy policy outlines how we collect, use, and protect your personal information.",
};

const PrivacyPolicyPage = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const sections = [
    {
      id: "information-we-collect",
      icon: <Database className="w-6 h-6 text-primary" />,
      title: "1. Information We Collect",
      content: (
        <>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include:
          </p>
          <ul className="space-y-3 mb-6">
            {[
              "Personal identification information (name, email address, phone number)",
              "Billing and shipping addresses",
              "Payment information (processed securely through our payment partners)",
              "Order history and preferences",
              "Communications with our customer service team",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </>
      )
    },
    {
      id: "how-we-use",
      icon: <Eye className="w-6 h-6 text-primary" />,
      title: "2. How We Use Your Information",
      content: (
        <>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="space-y-3 mb-6">
            {[
              "Process and fulfill your orders",
              "Communicate with you about your orders and account",
              "Provide customer support",
              "Send you promotional communications (with your consent)",
              "Improve our products and services",
              "Comply with legal obligations",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </>
      )
    },
    {
      id: "information-sharing",
      icon: <UserCheck className="w-6 h-6 text-primary" />,
      title: "3. Information Sharing and Disclosure",
      content: (
        <>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described below:
          </p>
          <ul className="space-y-3 mb-6">
            {[
              "Service providers who assist us in operating our website and conducting business",
              "Payment processors for secure transaction processing",
              "Shipping companies for order delivery",
              "Legal authorities when required by law or to protect our rights",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mt-6 flex gap-4 items-start shadow-sm">
            <Info className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm md:text-base text-foreground/80 leading-relaxed">
              <strong className="font-semibold text-foreground/90 block mb-1">Important Note:</strong>
              If we share any customer information with third parties, it is the merchant&apos;s responsibility to ensure proper data protection and compliance with applicable laws.
            </div>
          </div>
        </>
      )
    },
    {
      id: "data-security",
      icon: <Lock className="w-6 h-6 text-primary" />,
      title: "4. Data Security",
      content: (
        <p className="text-muted-foreground mb-6 leading-relaxed">
          We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
        </p>
      )
    },
    {
      id: "your-rights",
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "5. Your Rights",
      content: (
        <>
          <p className="text-muted-foreground mb-4 leading-relaxed">You have the right to:</p>
          <ul className="space-y-3 mb-6">
            {[
              "Access and update your personal information",
              "Request deletion of your personal data",
              "Opt-out of marketing communications",
              "Request a copy of your data",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </>
      )
    },
    {
      id: "cookies",
      icon: <Cookie className="w-6 h-6 text-primary" />,
      title: "6. Cookies and Tracking",
      content: (
        <p className="text-muted-foreground mb-6 leading-relaxed">
          We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors are coming from.
        </p>
      )
    },
    {
      id: "contact",
      icon: <Mail className="w-6 h-6 text-primary" />,
      title: "7. Contact Information",
      content: (
        <>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <div className="bg-muted/30 rounded-2xl p-6 md:p-8 space-y-6 md:space-y-0 md:space-x-8 md:flex md:items-start border border-border shadow-sm">
            <div className="flex-1">
              <div className="mb-6">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-primary/80">Email Support</span>
                <p className="text-foreground font-medium text-lg mt-1"><a href="mailto:prismbazar@gmail.com" className="hover:text-primary transition-colors">prismbazar@gmail.com</a></p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-primary/80">Phone Support</span>
                <p className="text-foreground font-medium text-lg mt-1"><a href="tel:+8801706473787" className="hover:text-primary transition-colors">+88 01706473787</a></p>
              </div>
            </div>
            <div className="hidden md:block w-px h-32 bg-border"></div>
            <div className="flex-1 pt-6 md:pt-0 border-t md:border-t-0 border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-primary/80 block mb-2">Office Address</span>
              <p className="text-foreground leading-relaxed text-base font-medium">
                Level 6, Block D, Shop No: 20-21,
                <br />
                Bashundhara city shopping complex,
                <br />
                Panthapath, Dhaka, 1215
              </p>
            </div>
          </div>
        </>
      )
    },
    {
      id: "changes",
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: "8. Changes to This Policy",
      content: (
        <p className="text-muted-foreground leading-relaxed">
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date below.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-muted/20 py-16 md:py-24 overflow-hidden border-b border-border">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        <div className="container mx-auto max-w-4xl px-4 relative z-10 text-center">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20 shadow-sm">
            <Shield className="w-4 h-4" />
            <span>Legal Information</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight text-balance">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your privacy is critically important to us. This policy outlines how we collect, use, and protect your personal information.
          </p>
          <p className="mt-8 text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
            Last Updated: <span className="text-foreground bg-muted px-2 py-1 rounded-md">{lastUpdated}</span>
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        <div className="bg-card border border-border shadow-sm rounded-3xl p-6 md:p-10 lg:p-14 relative overflow-hidden">
          {/* Subtle background abstract shape */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[100px] pointer-events-none"></div>

          <div className="space-y-16 relative z-10">
            {sections.map((section, index) => (
              <div
                key={section.id}
                id={section.id}
                className="scroll-mt-32 relative"
              >
                <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner flex items-center justify-center flex-shrink-0 mt-1">
                    {section.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight mb-4 flex items-center justify-between">
                      {section.title}
                    </h2>
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      {section.content}
                    </div>
                  </div>
                </div>

                {/* Divider between sections */}
                {index < sections.length - 1 && (
                  <div className="w-full h-px bg-border mt-12 md:max-w-[calc(100%-4.5rem)] md:ml-[5rem]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
