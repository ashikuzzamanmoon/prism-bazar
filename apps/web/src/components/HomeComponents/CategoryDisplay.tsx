import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ICollection } from "@/types/collectionTypes";

import React from "react";

export interface IContent {
  id: string;
  title: string;
  description: string;
  number: number;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  categories: ICollection[];
  contents?: IContent[];
}

export default function CategoryDisplay({ categories, contents = [] }: Props) {
  return (
    <div className=" bg-[#f8f8f8] py-16 w-full ">
      <div className=" max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-4xl primaryColor font-bold text-[#222]mb-5 nd:mb-8 leading-tight">
          EXPLORE
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-16">
          {/* Left side - categories */}
          <div className="w-full md:w-1/2 lg:w-2/5">
            <div className="space-y-0">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/products?collection=${category.slug}`}
                  className="flex items-center justify-between py-2 md:py-4 border-b border-gray-300 group"
                >
                  <div className="flex items-center gap-6">
                    <span className=" text-base md:text-lg font-medium text-gray-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className=" text-base md:text-lg font-medium text-gray-900">
                      {category.name}
                    </span>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-[#16a34a] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Stats grid */}
          <div className="w-full md:w-1/2 lg:w-3/5 border-none ">
            <div className="grid grid-cols-3 bg-[#16a34a]">
              {contents.slice(0, 3).map((item, index) => {
                if (index === 0) {
                  return (
                    <React.Fragment key={item.id}>
                      {/* Top row */}
                      <div className="relative bg-[#f8f8f8] h-28 md:h-36 rounded-br-3xl p-1.5 flex items-end justify-between overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={200}
                          height={300}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="bg-[#f8f8f8] w-full">
                        <div className="w-full text-center bg-[#16a34a] h-28 md:h-36 rounded-t-3xl flex flex-col justify-center items-center">
                          <span className="text-2xl md:text-5xl font-bold text-white">
                            {String(item.number).padStart(2, "0")}+
                          </span>
                          <p className="text-white text-xs md:text-base">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                }
                
                if (index === 1) {
                  return (
                    <React.Fragment key={item.id}>
                      {/* Middle row */}
                      <div className="relative bg-[#f8f8f8] h-28 md:h-36 rounded-bl-3xl p-1 md:p-0 flex items-end justify-between overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={200}
                          height={300}
                          className="h-full w-full py-4 md:py-2 object-contain"
                        />
                      </div>
                      <div className="bg-[#f8f8f8] w-full">
                        <div className="w-full bg-[#16a34a] rounded-tl-3xl h-28 md:h-36 rounded-bl-3xl rounded-br-3xl flex flex-col justify-center items-center">
                          <div className="z-10 text-center">
                            <span className="text-2xl md:text-5xl font-bold text-white">
                              {String(item.number).padStart(2, "0")}+
                            </span>
                            <p className="text-white text-xs md:text-base">{item.title}</p>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                }

                if (index === 2) {
                  return (
                    <React.Fragment key={item.id}>
                      {/* Bottom row */}
                      <div className="relative bg-[#f8f8f8] rounded-t-3xl h-28 md:h-36 p-1 md:p-3 flex items-end justify-between overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={200}
                          height={300}
                          className="h-full w-full p-2 md:p-0 object-contain"
                        />
                      </div>
                      <div className="bg-[#f8f8f8] w-full h-28 md:h-36">
                        <div className="w-full h-full bg-[#16a34a] rounded-tr-3xl rounded-bl-3xl rounded-br-3xl flex flex-col justify-center items-center">
                          <div className="z-10 text-center">
                            <span className="text-2xl md:text-5xl font-bold text-white">
                              {String(item.number).padStart(2, "0")}+
                            </span>
                            <p className="text-white text-xs md:text-base">{item.title}</p>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
