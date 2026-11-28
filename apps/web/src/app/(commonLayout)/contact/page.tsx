"use client";
import { Mail, Phone, MapPin, Globe, Clock, ArrowRight } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^01\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Phone number must be 11 digits starting with 01";
    }

    // Validate other required fields
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const toastId = toast.loading("Sending...");
    try {
      setLoading(true);

      // Simulated API call since the original one is not ready yet
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Message sent successfully!", { id: toastId, duration: 1500 });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      console.log("error", error);
      toast.error(error?.message || "Failed to send message!", {
        id: toastId,
        duration: 1500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <div className="relative pt-16 pb-28 lg:pt-20 lg:pb-32 bg-slate-900 overflow-hidden flex-shrink-0">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[80px] pointer-events-none transform -translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium mb-6 backdrop-blur-sm">
            <Globe className="w-4 h-4" />
            <span className="tracking-wide uppercase">We are here for you</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6">
            Let&apos;s Start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Conversation</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            খাঁটি অর্গানিক খাদ্য সামগ্রী, শিক্ষার্থীদের স্টাডি মেটেরিয়ালস বা পাইকারি অর্ডারের জন্য যেকোনো তথ্যে আমাদের সাথে যোগাযোগ করুন। আমাদের টিম আপনাকে সার্বক্ষণিক সহায়তা প্রদানে প্রস্তুত।
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Contact Information Cards (Left Column - 5 cols) */}
          <div className="col-span-1 lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 h-full flex flex-col relative overflow-hidden group">
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150"></div>

              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Get in Touch</h2>
                <p className="text-slate-500 mb-10 text-lg leading-relaxed">Reach out to us through any of these channels and we will respond as soon as possible.</p>

                <div className="space-y-6 flex-grow">
                  {/* Phone */}
                  <div className="flex items-start gap-5 p-4 -mx-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div className="pt-1">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</h3>
                      <a href="tel:+8801712714334" className="text-lg font-bold text-slate-800 hover:text-primary transition-colors inline-block">
                        +88 01712-714334
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-5 p-4 -mx-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div className="pt-1">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</h3>
                      <a href="mailto:prismbazar@gmail.com" className="text-lg font-bold text-slate-800 hover:text-primary transition-colors inline-block break-all">
                        prismbazar@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-5 p-4 -mx-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div className="pt-1">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Our Office</h3>
                      <p className="text-slate-800 font-medium leading-relaxed text-lg">
                        কাজীপুর, সিরাজগঞ্জ,<br />
                        রাজশাহী বিভাগ, বাংলাদেশ
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Working Hours mini banner */}
              <div className="mt-10 bg-slate-900 rounded-3xl p-6 text-white flex items-center gap-5 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/30 rounded-full blur-xl -mr-10 -mt-10"></div>
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 relative z-10 backdrop-blur-md">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="relative z-10">
                  <h4 className="font-bold text-white text-lg tracking-tight">Working Hours</h4>
                  <p className="text-slate-300 font-medium">10:00 AM - 8:00 PM (Wed Off)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section (Right Column - 7 cols) */}
          <div className="col-span-1 lg:col-span-7">
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/40 border border-slate-100">
              <div className="mb-10">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Send Us a Message</h2>
                <p className="text-slate-500 text-lg leading-relaxed">Fill out the form below and our team will get back to you within 24 hours.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Your Name
                  </label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    required
                    className={`h-14 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 transition-all px-5 text-base ${errors.name ? "border-red-500 ring-2 ring-red-500/20" : ""}`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1 ml-1 font-medium">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. john@example.com"
                      required
                      className={`h-14 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 transition-all px-5 text-base ${errors.email ? "border-red-500 ring-2 ring-red-500/20" : ""}`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1 ml-1 font-medium">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="017xxxxxxxx"
                      required
                      maxLength={11}
                      className={`h-14 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 transition-all px-5 text-base ${errors.phone ? "border-red-500 ring-2 ring-red-500/20" : ""}`}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1 ml-1 font-medium">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Subject
                  </label>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="How can we help you?"
                    required
                    className={`h-14 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 transition-all px-5 text-base ${errors.subject ? "border-red-500 ring-2 ring-red-500/20" : ""}`}
                  />
                  {errors.subject && <p className="text-red-500 text-sm mt-1 ml-1 font-medium">{errors.subject}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Your Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Please describe your inquiry in detail..."
                    required
                    className={`rounded-3xl border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 transition-all p-5 text-base resize-none ${errors.message ? "border-red-500 ring-2 ring-red-500/20" : ""}`}
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1 ml-1 font-medium">{errors.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white text-lg font-bold shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-3 group mt-4"
                >
                  {loading ? (
                    "Sending Message..."
                  ) : (
                    <>
                      Send Message
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-24 mb-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 mb-6 shadow-sm">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Visit Our Store</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">Experience our premium tech products in person. Get expert advice directly from our tech specialists.</p>
          </div>

          <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-white bg-slate-100 group">
            <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none"></div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14500.472845611812!2d90.3907697!3d23.7511832!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b9007ebaf311%3A0xef2fcb8f2181add8!2sPrism Bazar!5e0!3m2!1sen!2sbd!4v1693658391234!5m2!1sen!2sbd"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'contrast(1.05) saturate(1.1)' }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
            ></iframe>

            {/* Map Overlay Badge */}
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl z-20 max-w-xs border border-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center animate-bounce shadow-lg shadow-primary/30">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 tracking-tight">Prism Bazar</p>
                  <p className="text-sm font-medium text-slate-500">কাজীপুর, সিরাজগঞ্জ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
