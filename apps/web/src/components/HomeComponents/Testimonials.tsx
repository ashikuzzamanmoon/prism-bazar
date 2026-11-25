"use client";
import Marquee from "react-fast-marquee";
import { Star } from "lucide-react";
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

const Testimonials = () => {
  const isMobile = useIsMobile();
  const isMdScreen = !isMobile;

  const testimonials2 = [
    {
      id: 1,
      quote:
        "Bought a Lenovo ThinkPad from here, delivery to Dhaka was super fast. Battery backup is amazing, using it for my office work every day.",
      name: "Rakibul Hasan",
      role: "Software Engineer",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5,
    },
    {
      id: 2,
      quote:
        "Ordered a MacBook Air for my graphic design projects. Packaging was secure and got official warranty papers. Highly recommended!",
      name: "Nusrat Jahan",
      role: "Graphic Designer",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      rating: 5,
    },
    {
      id: 3,
      quote:
        "As a student in Chittagong, I was worried about authenticity. The Acer Aspire I got is genuine, and their EMI option was a lifesaver.",
      name: "Shakib Al Mahmud",
      role: "University Student",
      avatar: "https://randomuser.me/api/portraits/men/28.jpg",
      rating: 4,
    },
    {
      id: 4,
      quote:
        "My gaming laptop (Asus ROG) arrived within 3 days. Performance is smooth for Valorant and FIFA. Customer support was very responsive.",
      name: "Tanvir Ahmed",
      role: "Gamer",
      avatar: "https://randomuser.me/api/portraits/men/76.jpg",
      rating: 5,
    },
    {
      id: 5,
      quote:
        "Bought HP Pavilion for online classes and freelancing. Value for money and the keyboard is very comfortable for long typing sessions.",
      name: "Farzana Akter",
      role: "Freelancer",
      avatar: "https://randomuser.me/api/portraits/women/60.jpg",
      rating: 4,
    },
  ];

  // Function to render star ratings
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-[#FF7200] fill-[#FF7200]" : "text-gray-300"
            }`}
        />
      ));
  };

  return (
    <div className=" pb-10 md:pb-16 pt-4 md:pt-8 text-white">
      <section className="relative overflow-hidden max-w-6xl mx-auto">
        <div className="container mx-auto px-4 mb-4 md:mb-10">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="text-xl md:text-4xl font-bold primaryColor mb-2 md:mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Don t just take our word for it. Hear from our satisfied customers
              about their experience with our furniture.
            </p>
          </div>
        </div>

        {/* Second marquee - right to left */}
        <div className="">
          <Marquee speed={30} direction="right" gradient={isMdScreen}>
            {testimonials2.map((testimonial) => (
              <Card
                key={testimonial.id}
                className=" bg-white border border-primary/50 min-w-[300px] max-w-[350px] mx-4 overflow-hidden relative h-[220px]"
              >
                <CardContent className="absolute inset-0 px-4 py-3 flex flex-col justify-center z-10">
                  <div className="flex justify-between items-start mb-3">
                    <Quote className="text-gray-800 h-8 w-8 opacity-70" />
                    <div className="flex">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>

                  <p className="text-gray-800 text-xs line-clamp-4">
                    {testimonial.quote}
                  </p>

                  <div className="flex items-center mt-2">
                    <Avatar className="h-10 w-10 mr-3 ">
                      <AvatarImage
                        src={""}
                        alt={testimonial.name}
                      />
                      <AvatarFallback className="bg-primary text-white">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Marquee>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;
