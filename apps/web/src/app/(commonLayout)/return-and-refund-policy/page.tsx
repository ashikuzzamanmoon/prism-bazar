import React from "react";
import type { Metadata } from "next";
import { Truck, RotateCcw, CreditCard, AlertTriangle, RefreshCw, Mail, CheckCircle2, XCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Return & Refund Policy | Prism Bazar",
  description: "Information about our shipping methods, delivery times, and return policies.",
};

const ShippingPolicyPage = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const sections = [
    {
      id: "shipping-info",
      icon: <Truck className="w-6 h-6 text-primary" />,
      title: "1. Shipping Information",
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary/70" />
              Delivery Areas
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We currently deliver to all areas within Bangladesh. Shipping costs and delivery times vary based on your location.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary/70" />
              Delivery Timeframes
            </h3>
            <div className="bg-muted/30 border border-border rounded-xl p-5 mb-4 shadow-sm">
              <ul className="list-none space-y-0 text-foreground">
                <li className="flex justify-between items-center py-3 border-b border-border/50">
                  <span className="font-medium flex items-center gap-2">সিরাজগঞ্জ সদর ও কাজিপুর (লোকাল ডেলিভারি)</span>
                  <span className="text-primary font-bold bg-primary/10 px-3 py-1 rounded-full text-sm">
                    ১২ - ২৪ ঘণ্টা
                  </span>
                </li>
                <li className="flex justify-between items-center py-3">
                  <span className="font-medium flex items-center gap-2">সারা বাংলাদেশ (কুরিয়ার সার্ভিস)</span>
                  <span className="text-primary font-bold bg-primary/10 px-3 py-1 rounded-full text-sm">
                    ২ - ৪ কার্যদিবস
                  </span>
                </li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground/80 italic flex items-start gap-2">
              <span className="text-primary">*</span>
              Delivery times are calculated from the date of order confirmation and may vary during peak seasons, holidays, or due to unforeseen circumstances.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary/70" />
              Order Processing
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Orders are processed within 1-2 business days after payment confirmation. You will receive a tracking number once your order has been shipped.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "return-policy",
      icon: <RotateCcw className="w-6 h-6 text-primary" />,
      title: "2. Return & Refund Policy",
      content: (
        <div className="space-y-8">
          <div className="bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 rounded-2xl p-5 flex gap-4 items-start shadow-sm">
            <Clock className="w-6 h-6 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-1">
                Return Timeline
              </h3>
              <p className="text-green-700/90 dark:text-green-300/90 leading-relaxed">
                You can return items within <strong className="font-bold">7 to 10 working days</strong> from the date of delivery for a full refund or exchange.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500/70" />
              Eligible Returns
            </h3>
            <p className="text-muted-foreground mb-3">Items are eligible for return if they:</p>
            <ul className="space-y-3">
              {[
                "Are in original condition with tags attached",
                "Have not been used, worn, or damaged",
                "Are returned in original packaging",
                "Include all accessories and documentation"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive/70" />
              Non-Returnable Items
            </h3>
            <div className="bg-destructive/5 rounded-xl p-5 border border-destructive/10">
              <ul className="space-y-3">
                {[
                  "Personalized or customized products",
                  "Perishable goods",
                  "Intimate or sanitary goods",
                  "Items damaged by misuse"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                    <XCircle className="w-4 h-4 text-destructive/70 mt-1 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary/70" />
              Return Process
            </h3>
            <div className="relative border-l-2 border-primary/20 ml-3 pl-6 space-y-6">
              {[
                "Contact our customer service team within the return window",
                "Provide your order number and reason for return",
                "Receive return authorization and instructions",
                "Package items securely and ship to our return address",
                "Refund will be processed within 7-10 working days after we receive the returned item"
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[35px] bg-card border-2 border-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-primary text-sm">
                    {idx + 1}
                  </div>
                  <p className="text-muted-foreground leading-relaxed pt-1.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: "refund-info",
      icon: <CreditCard className="w-6 h-6 text-primary" />,
      title: "3. Refund Information",
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary/70" />
              Refund Processing
            </h3>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 shadow-sm">
              <p className="text-foreground/80 leading-relaxed">
                <strong className="text-primary font-semibold">Processing Time:</strong> Refunds are processed within 7-10 working days after we receive and inspect the returned item.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary/70" />
              Refund Methods
            </h3>
            <ul className="space-y-3">
              {[
                "Original payment method (for card payments)",
                "Bank transfer (for cash on delivery orders)",
                "Store credit (if preferred)"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary/70" />
              Shipping Costs
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Original shipping costs are non-refundable unless the return is due
              to our error (wrong item sent, defective product, etc.). Return
              shipping costs are the customer&apos;s responsibility unless
              otherwise specified.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "damaged-items",
      icon: <AlertTriangle className="w-6 h-6 text-primary" />,
      title: "4. Damaged or Defective Items",
      content: (
        <>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            If you receive a damaged or defective item:
          </p>
          <ul className="space-y-3">
            {[
              "Contact us immediately with photos of the damage",
              "We will arrange for return pickup at no cost to you",
              "Full refund or replacement will be provided",
              "We will cover all return shipping costs"
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </>
      )
    },
    {
      id: "exchange-policy",
      icon: <RefreshCw className="w-6 h-6 text-primary" />,
      title: "5. Exchange Policy",
      content: (
        <p className="text-muted-foreground leading-relaxed">
          We offer exchanges for size or color variations within the same
          return window. The exchange process follows the same timeline as
          returns, and any price difference will be charged or refunded
          accordingly.
        </p>
      )
    },
    {
      id: "contact",
      icon: <Mail className="w-6 h-6 text-primary" />,
      title: "6. Contact Information",
      content: (
        <>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            For shipping inquiries, returns, or refunds, please contact us:
          </p>
          <div className="bg-muted/30 rounded-2xl p-6 md:p-8 space-y-6 md:space-y-0 md:space-x-8 md:flex md:items-start border border-border shadow-sm">
            <div className="flex-1">
              <div className="mb-6">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-primary/80">Support Options</span>
                <p className="text-foreground font-medium text-lg mt-1"><a href="mailto:prismbazar@gmail.com" className="hover:text-primary transition-colors">prismbazar@gmail.com</a></p>
                <p className="text-foreground font-medium text-lg mt-1"><a href="tel:+8801712714334" className="hover:text-primary transition-colors">+88 01712-714334</a></p>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground mt-4 bg-primary/5 p-3 rounded-lg border border-primary/10">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Hours:</strong> Sunday to Thursday, 10:00 AM - 11:00 PM</span>
              </div>
            </div>
            <div className="hidden md:block w-px h-32 bg-border"></div>
            <div className="flex-1 pt-6 md:pt-0 border-t md:border-t-0 border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-primary/80 block mb-2">Office Address</span>
              <p className="text-foreground leading-relaxed text-base font-medium">
                আলামপুর চৌরাস্তা, কাজীপুর, সিরাজগঞ্জ,
                <br />
                রাজশাহী বিভাগ, বাংলাদেশ
              </p>
            </div>
          </div>
        </>
      )
    },
    {
      id: "policy-updates",
      icon: <RotateCcw className="w-6 h-6 text-primary" />,
      title: "7. Policy Updates",
      content: (
        <p className="text-muted-foreground leading-relaxed">
          This return and refund policy may be updated from time to time.
          Any changes will be posted on this page with an updated revision
          date. Please review this policy periodically for any changes.
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
            <Truck className="w-4 h-4" />
            <span>Shipping & Returns</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight text-balance">
            Return & Refund Policy
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our delivery areas, timelines, and how to return or exchange products.
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
                    <h2 className="text-2xl font-bold text-foreground tracking-tight mb-6 flex items-center justify-between">
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

export default ShippingPolicyPage;
