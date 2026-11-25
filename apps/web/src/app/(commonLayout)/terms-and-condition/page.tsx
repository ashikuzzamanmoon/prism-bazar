import React from "react";
import type { Metadata } from "next";
import { CheckCircle2, Building2, ShoppingBag, CreditCard, Truck, UserCheck, Megaphone, ShieldAlert, Scale, Mail, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Condition | Prism Bazar",
  description: "Read our Terms & Condition to understand the rules, guidelines, and agreements for using our website.",
};

const TermsOfServicePage = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const sections = [
    {
      id: "acceptance",
      icon: <CheckCircle2 className="w-6 h-6 text-primary" />,
      title: "1. Acceptance of Terms",
      content: (
        <p className="text-muted-foreground leading-relaxed">
          By accessing and using this website, you accept and agree to be
          bound by the terms and provision of this agreement. If you do not
          agree to abide by the above, please do not use this service.
        </p>
      )
    },
    {
      id: "company-info",
      icon: <Building2 className="w-6 h-6 text-primary" />,
      title: "2. Company Information",
      content: (
        <div className="bg-muted/30 border border-border rounded-xl p-5 shadow-sm">
          <ul className="space-y-4">
            <li className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-b border-border/50 pb-3">
              <span className="font-semibold text-foreground sm:w-1/3">Trade License Number</span>
              <span className="text-muted-foreground sm:w-2/3">TRAD/DNCC/025530/2024</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-b border-border/50 pb-3">
              <span className="font-semibold text-foreground sm:w-1/3">TIN Certificate Number</span>
              <span className="text-muted-foreground sm:w-2/3">738884993913</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
              <span className="font-semibold text-foreground sm:w-1/3">Registered Address</span>
              <span className="text-muted-foreground sm:w-2/3">কাজীপুর, সিরাজগঞ্জ,<br />রাজশাহী বিভাগ, বাংলাদেশ</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "products",
      icon: <ShoppingBag className="w-6 h-6 text-primary" />,
      title: "3. Product Information and Availability",
      content: (
        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            We strive to provide accurate product information, including
            descriptions, prices, and availability. However, we reserve the
            right to:
          </p>
          <ul className="space-y-3">
            {[
              "Modify product information without prior notice",
              "Discontinue products at any time",
              "Limit quantities available for purchase"
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start shadow-sm mt-4">
            <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-blue-800 dark:text-blue-300/90 text-sm md:text-base leading-relaxed">
              Product stock quantities are displayed on product detail pages. Out-of-stock products will be clearly marked in product images and descriptions.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "ordering",
      icon: <CreditCard className="w-6 h-6 text-primary" />,
      title: "4. Ordering and Payment",
      content: (
        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            When placing an order, you agree to provide accurate and complete
            information. All orders are subject to acceptance and availability.
          </p>

          <div className="bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 rounded-xl p-5 shadow-sm">
            <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Checkout Agreement
            </h4>
            <p className="text-green-700/90 dark:text-green-300/90 leading-relaxed text-sm md:text-base">
              During checkout, you must read and agree to our Terms & Conditions,
              Privacy Policy, and Return & Refund Policy by checking the agreement checkbox
              before placing your order.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "delivery",
      icon: <Truck className="w-6 h-6 text-primary" />,
      title: "5. Delivery Policy",
      content: (
        <div className="bg-muted/30 border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Delivery Timeframes
          </h3>
          <ul className="space-y-4 mb-4">
            <li className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="font-medium text-muted-foreground flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary/70" /> Inside Dhaka
              </span>
              <span className="text-primary font-bold bg-primary/10 px-3 py-1 rounded-full text-sm">
                5 working days
              </span>
            </li>
            <li className="flex justify-between items-center py-2">
              <span className="font-medium text-muted-foreground flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary/70" /> Outside Dhaka
              </span>
              <span className="text-primary font-bold bg-primary/10 px-3 py-1 rounded-full text-sm">
                10 working days
              </span>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground/80 italic flex items-start gap-2 pt-2 border-t border-border/50">
            <span className="text-primary">*</span>
            Delivery times may vary during peak seasons or due to unforeseen circumstances.
          </p>
        </div>
      )
    },
    {
      id: "responsibilities",
      icon: <UserCheck className="w-6 h-6 text-primary" />,
      title: "6. User Responsibilities",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground mb-2">You agree to:</p>
          <ul className="space-y-3">
            {[
              "Provide accurate and truthful information",
              "Maintain the security of your account credentials",
              "Use the website in accordance with applicable laws",
              "Not engage in fraudulent or harmful activities",
              "Respect intellectual property rights"
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: "ads",
      icon: <Megaphone className="w-6 h-6 text-primary" />,
      title: "7. Third-Party Content and Advertisements",
      content: (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex gap-4 items-start shadow-sm">
          <Megaphone className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm md:text-base text-foreground/80 leading-relaxed">
            <strong className="font-semibold text-foreground/90 block mb-1">Important Notice:</strong>
            Third-party advertisements are not allowed on this platform. If any third-party
            advertisements appear, it is the merchant&apos;s responsibility to ensure compliance
            with applicable laws and regulations.
          </div>
        </div>
      )
    },
    {
      id: "liability",
      icon: <ShieldAlert className="w-6 h-6 text-primary" />,
      title: "8. Limitation of Liability",
      content: (
        <p className="text-muted-foreground leading-relaxed">
          We shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages resulting from your use of the
          website or products purchased through it.
        </p>
      )
    },
    {
      id: "governing-law",
      icon: <Scale className="w-6 h-6 text-primary" />,
      title: "9. Governing Law",
      content: (
        <p className="text-muted-foreground leading-relaxed">
          These terms shall be governed by and construed in accordance with
          the laws of Bangladesh. Any disputes shall be subject to the
          jurisdiction of the courts of Bangladesh.
        </p>
      )
    },
    {
      id: "contact",
      icon: <Mail className="w-6 h-6 text-primary" />,
      title: "10. Contact Information",
      content: (
        <>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            For questions about these Terms & Condition, please contact us:
          </p>
          <div className="bg-muted/30 rounded-2xl p-6 md:p-8 space-y-6 md:space-y-0 md:space-x-8 md:flex md:items-start border border-border shadow-sm">
            <div className="flex-1">
              <div className="mb-6">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-primary/80">Email Contact</span>
                <p className="text-foreground font-medium text-lg mt-1"><a href="mailto:prismbazar@gmail.com" className="hover:text-primary transition-colors">prismbazar@gmail.com</a></p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-primary/80">Phone Contact</span>
                <p className="text-foreground font-medium text-lg mt-1"><a href="tel:+8801706473787" className="hover:text-primary transition-colors">+88 01706473787</a></p>
              </div>
            </div>
            <div className="hidden md:block w-px h-32 bg-border"></div>
            <div className="flex-1 pt-6 md:pt-0 border-t md:border-t-0 border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-primary/80 block mb-2">Office Address</span>
              <p className="text-foreground leading-relaxed text-base font-medium">
                কাজীপুর, সিরাজগঞ্জ,
                <br />
                রাজশাহী বিভাগ, বাংলাদেশ
              </p>
            </div>
          </div>
        </>
      )
    },
    {
      id: "changes",
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: "11. Changes to Terms",
      content: (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 shadow-sm text-foreground/80 leading-relaxed text-sm md:text-base space-y-2">
          <p>
            We reserve the right to modify these terms at any time. Changes
            will be effective immediately upon posting on the website.
          </p>
          <p className="font-medium text-foreground">
            Your continued use constitutes acceptance of the modified terms.
          </p>
        </div>
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
            <FileText className="w-4 h-4" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight text-balance">
            Terms & Condition
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before using our services. They contain important information about your rights and obligations.
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
                    <h2 className="text-2xl font-bold text-foreground tracking-tight mb-5 flex items-center justify-between">
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

export default TermsOfServicePage;
