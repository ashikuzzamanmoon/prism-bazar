"use client";
import { Target, Telescope, CheckCircle2 } from "lucide-react";
import Image from "next/image";

const AboutBanner = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Hero Section */}
      <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden bg-slate-900">
        {/* Video Background */}
        <video
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-in fade-in duration-1000"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/prism-bazar.jpg"
          ref={(videoRef) => {
            if (videoRef && videoRef.paused) {
              videoRef.play().catch(() => { });
            }
          }}
        >
          <source src="/AboutBanner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 backdrop-blur-[2px]"></div>

        {/* Hero Content */}
        <div className="absolute inset-0 relative z-10 flex flex-col items-center justify-center h-full text-center px-4 md:px-8 max-w-5xl mx-auto">
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-1000">
            <span className="text-primary font-bold tracking-widest uppercase text-sm md:text-base mb-2 block">
              Discover the Prism Bazar Difference
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight">
              Innovation Meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Excellence</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-medium max-w-2xl mx-auto mb-8">
              Curating cutting-edge technology products that set the standard for performance, innovation, and personalized service.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-7xl">
        {/* Intro Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          <div className="relative h-[500px] lg:h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl group">
            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
            <Image
              src={"/prism-bazar.jpg"}
              alt="Modern laptop workspace"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 z-20">
              <p className="text-white font-medium text-xl">Premium Experience</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm tracking-wide uppercase mb-2">
              Who We Are
            </div>
            <h2 className="text-foreground leading-tight tracking-tight font-extrabold text-3xl md:text-4xl lg:text-5xl">
              We are a premium <span className="text-primary">laptop & tech</span> solutions provider
            </h2>
            <div className="space-y-6 text-muted-foreground md:text-lg leading-relaxed">
              <p>
                We strive to curate and deliver cutting-edge technology products
                that set the standard for performance, innovation, and
                personalized service to help you create a digital ecosystem that
                enhances your life and work.
              </p>
              <p>
                We believe in the power of technology and how it can transform
                your productivity and creativity. That is why everything we do is
                centered around providing devices that reflect your unique needs,
                with products built to last and perform for years to come.
              </p>
              <p>
                Our commitment to excellence is reflected in every laptop we offer.
                From our high-performance gaming rigs, ultralight business
                laptops, creative workstations to our range of accessories
                designed to enhance your computing experience, we take pride in
                our technical expertise and dedication to customer satisfaction.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us & Mission/Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          {/* Why Choose Us - Takes 5 columns */}
          <div className="col-span-1 lg:col-span-5 relative overflow-hidden bg-slate-900 border border-slate-800 dark:border-slate-800 rounded-3xl p-8 md:p-10 shadow-xl text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="font-extrabold text-3xl mb-8 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-primary rounded-full block"></span>
                Why Choose Us?
              </h2>
              <ul className="space-y-6">
                {[
                  "Fast Shipping Nationwide with Tracking",
                  "Extended Warranty & Technical Support",
                  "Competitive Pricing on Premium Brands",
                  "30-Day Hassle-Free Returns",
                  "Expert Tech Advice & Configuration",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span className="font-medium text-slate-200 text-lg leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mission & Vision - Takes 7 columns */}
          <div className="col-span-1 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col justify-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-bold text-card-foreground text-2xl mb-4">
                Our Mission
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                To empower individuals and businesses with cutting-edge
                technology solutions that enhance productivity, creativity, and
                digital experiences.
              </p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col justify-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Telescope className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-bold text-card-foreground text-2xl mb-4">
                Our Vision
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                To be the leading destination for premium tech products, where
                innovation meets exceptional customer experience, making
                advanced technology accessible to everyone.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Footer */}
        <div className="py-12 border-t border-border">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Explore Our Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Find the perfect device tailored to your specific needs and lifestyle.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Gaming Laptops Feature */}
            <div className="group bg-card hover:bg-accent/5 focus-within:bg-accent/5 border border-transparent hover:border-accent/20 transition-all duration-300 p-8 rounded-3xl text-center shadow-sm hover:shadow-md">
              <div className="mx-auto w-20 h-20 bg-primary/10 flex items-center justify-center rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-10 h-10 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.5 8.5H6.5C5.94772 8.5 5.5 8.94772 5.5 9.5V16.5C5.5 17.0523 5.94772 17.5 6.5 17.5H17.5C18.0523 17.5 18.5 17.0523 18.5 16.5V9.5C18.5 8.94772 18.0523 8.5 17.5 8.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M12 17.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.5 13H18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.5 21.5L5.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20.5 21.5L18.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.5 5.5L9.5 2.5H14.5L20.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Gaming Laptops</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our gaming laptops deliver more than just high FPS—they
                provide immersive experiences with cutting-edge graphics and
                performance.
              </p>
            </div>

            {/* Business Laptops Feature */}
            <div className="group bg-card hover:bg-accent/5 focus-within:bg-accent/5 border border-transparent hover:border-accent/20 transition-all duration-300 p-8 rounded-3xl text-center shadow-sm hover:shadow-md">
              <div className="mx-auto w-20 h-20 bg-primary/10 flex items-center justify-center rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-10 h-10 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 7.5V16.5C20 17.0523 19.5523 17.5 19 17.5H5C4.44772 17.5 4 17.0523 4 16.5V7.5C4 6.94772 4.44772 6.5 5 6.5H19C19.5523 6.5 20 6.94772 20 7.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M12 17.5V20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 20.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 13.5H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Business Laptops</h3>
              <p className="text-muted-foreground leading-relaxed">
                From ultralight portables to powerful workstations, our
                business laptops combine reliability, security, and
                performance.
              </p>
            </div>

            {/* Accessories Feature */}
            <div className="group bg-card hover:bg-accent/5 focus-within:bg-accent/5 border border-transparent hover:border-accent/20 transition-all duration-300 p-8 rounded-3xl text-center shadow-sm hover:shadow-md">
              <div className="mx-auto w-20 h-20 bg-primary/10 flex items-center justify-center rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-10 h-10 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 8.5H4C3.44772 8.5 3 8.94772 3 9.5V14.5C3 15.0523 3.44772 15.5 4 15.5H7C7.55228 15.5 8 15.0523 8 14.5V9.5C8 8.94772 7.55228 8.5 7 8.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M20 8.5H17C16.4477 8.5 16 8.94772 16 9.5V14.5C16 15.0523 16.4477 15.5 17 15.5H20C20.5523 15.5 21 15.0523 21 14.5V9.5C21 8.94772 20.5523 8.5 20 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 2.5V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 18.5V21.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Accessories</h3>
              <p className="text-muted-foreground leading-relaxed">
                Enhance your computing experience with our premium
                accessories—from high-performance peripherals to ergonomic
                solutions.
              </p>
            </div>
          </div>
        </div>

        {/* Management Team Section */}
        <div className="py-16 mt-12 mb-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-border">
          <div className="text-center mb-12 px-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm tracking-wide uppercase mb-4">
              Leadership
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Management Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Meet the forward-thinking individuals driving our vision to deliver the best technology solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8 md:px-12">
            {/* Team Member 1 */}
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 text-center group">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-primary/10 group-hover:border-primary/30 transition-colors">
                <Image
                  src="/about/rafi.webp"
                  alt="MD Rafiul Islam"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full object-top"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">MD Rafiul Islam</h3>
              <p className="text-primary font-medium">Co-Owner</p>
            </div>

            {/* Team Member 2 */}
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 text-center group">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-primary/10 group-hover:border-primary/30 transition-colors">
                <Image
                  src="/about/habib.webp"
                  alt="Habibur Rahman"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Habibur Rahman</h3>
              <p className="text-primary font-medium">Co-Owner</p>
            </div>

            {/* Team Member 3 */}
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 text-center group">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-primary/10 group-hover:border-primary/30 transition-colors">
                <Image
                  src="/placeholder.svg"
                  alt="MD Tushar Ahmed"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">MD Tushar Ahmed</h3>
              <p className="text-primary font-medium">Co-Owner</p>
            </div>

            {/* Team Member 4 */}
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 text-center group">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-primary/10 group-hover:border-primary/30 transition-colors">
                <Image
                  src="/placeholder.svg"
                  alt="Abu Saleh Mohammad Nayem"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Abu Saleh Mohammad Nayem</h3>
              <p className="text-primary font-medium">Co-Owner</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutBanner;
