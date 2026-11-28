import Image from "next/image";
import Link from "next/link";

const NewFooter = () => {
  const sslImages = [
    { name: "amex", src: "/ssl/amex.svg" },
    { name: "bkash", src: "/ssl/bkash.svg" },
    { name: "dinersclub", src: "/ssl/dinersclub.svg" },
    { name: "dmoney", src: "/ssl/dmoney.svg" },
    { name: "ipay", src: "/ssl/ipay.svg" },
    { name: "mastercard", src: "/ssl/mastercard.svg" },
    { name: "nagad", src: "/ssl/nagad.svg" },
    { name: "nexus", src: "/ssl/nexus.svg" },
    { name: "qcash", src: "/ssl/qcash.svg" },
    { name: "rocket", src: "/ssl/rocket.svg" },
    { name: "surecash", src: "/ssl/surecash.svg" },
    { name: "tapnpay", src: "/ssl/tapnpay.svg" },
    { name: "unionpay", src: "/ssl/unionpay.svg" },
    { name: "visa", src: "/ssl/visa.svg" },
  ];

  return (
    <footer className="bg-gray-100 px-6 md:px-16 py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* About */}
        <div className="col-span-12 md:col-span-6">
          <div className="flex items-center h-8">
            <Link href="/" className="flex items-center md:mt-12 -ml-3 md:-ml-6 md:mb-12">
              <Image
                src="/prism-bazar-logo.svg"
                alt="Prism Bazar Logo"
                width={200}
                height={60}
                className="w-36 sm:w-44 md:w-52 h-auto object-contain"
              />
            </Link>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed my-8 max-w-sm">
            সিরাজগঞ্জ ও কাজীপুরসহ সারাদেশে খাঁটি অর্গানিক খাদ্য এবং শিক্ষার্থীদের শিক্ষা সহায়ক ও ডিজিটাল শিট সরবরাহকারী নির্ভরযোগ্য অনলাইন প্ল্যাটফর্ম।
          </p>

          {/* Social Icons */}
          <div className="flex space-x-3">
            <a
              href="#"
              className="text-gray-600 hover:text-amber-500"
            >
              <Image
                src={
                  "https://cdn-icons-png.flaticon.com/128/5968/5968764.png"
                }
                alt="facebook"
                width={30}
                height={30}
              />
            </a>
            <a
              href="https://www.tiktok.com/@prismbazar?_t=ZS-8zLJWLWYsE8&_r=1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-amber-500"
            >
              <Image
                src={
                  "https://cdn-icons-png.flaticon.com/128/15789/15789316.png"
                }
                alt="facebook"
                width={30}
                height={30}
              />
            </a>
            <a
              href="https://youtube.com/@prismbazar?si=jZwr3_XNhefbN_wW"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-amber-500"
            >
              <Image
                src={
                  "https://cdn-icons-png.flaticon.com/128/3670/3670147.png"
                }
                alt="facebook"
                width={30}
                height={30}
              />
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-amber-500"
            >
              <Image
                src={
                  "https://cdn-icons-png.flaticon.com/128/3955/3955024.png"
                }
                alt="facebook"
                width={30}
                height={30}
              />
            </a>
          </div>
        </div>

        {/* Pages */}
        <div className="col-span-6 md:col-span-2">
          <h3 className="text-xl font-semibold mb-6">Pages</h3>
          <ul className="space-y-4">
            {[
              { label: "Home", href: "/" },
              { label: "About", href: "/about" },
              { label: "Shop", href: "/products" },
              { label: "অর্গানিক ও শিক্ষা সামগ্রী", href: "/products" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-gray-500 hover:text-black transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div className="col-span-6 md:col-span-2">
          <h3 className="text-xl font-semibold mb-6">Support</h3>
          <ul className="space-y-4">
            {[
              { label: "Contact", href: "/contact" },
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Terms & Condition", href: "/terms-and-condition" },
              { label: "Return & Refund Policy", href: "/return-and-refund-policy" },
              { label: "Warranty Policy", href: "/warranty-policy" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-gray-500 hover:text-black transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Address */}
        <div className="col-span-12 md:col-span-2">
          <h3 className="text-xl font-semibold mb-6">Address</h3>

          <p className="text-sm font-medium text-gray-500 whitespace-pre-line mb-4">
            কাজীপুর, সিরাজগঞ্জ
          </p>

          <a
            href="tel:+8801706473787"
            className="block text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            +88 01706473787
          </a>

          <a
            href="mailto:prismbazar@gmail.com"
            className="block text-sm font-medium text-gray-500 hover:text-black transition-colors mt-2"
          >
            prismbazar@gmail.com
          </a>
        </div>
      </div>

      {/* SSL Section */}
      <div className="max-w-7xl mx-auto mt-12 flex flex-col items-center justify-center gap-6">
        <Image
          src="/ssl/ssllogo.png"
          alt="SSL Secure"
          width={140}
          height={50}
          className="object-contain"
        />

        <div className="flex flex-wrap justify-center md:justify-end items-center gap-3 ">
          {sslImages.map((image) => (
            <Image
              key={image.name}
              src={image.src}
              alt={image.name}
              width={100}
              height={100}
              className=" h-10 w-auto object-contain"
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;