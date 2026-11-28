"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { IProductFeature } from "@/types/productTypes";
import { Settings } from "lucide-react";

export function ProductSpecs({ features = [] }: { features?: IProductFeature[] }) {
    if (!features || features.length === 0) return null;

    return (
        <div>
            <div className="mt-8 md:mt-12 lg:mt-12 border-t pt-8 md:pt-8">
                <h1 className="text-xl md:text-2xl font-semibold bg-primary text-white p-2 px-4 rounded-md mb-6 flex w-fit items-center gap-2">
                    <Settings className="w-5 h-5 md:w-6 md:h-6" />
                    পণ্যের বিবরণ ও বৈশিষ্ট্য
                </h1>
                {features.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[...features].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((section) => (
                            <Card
                                key={section.id}
                                className=" bg-white shadow-none hover:shadow-lg transition-shadow duration-300"
                            >
                                <CardHeader className="">
                                    <CardTitle className="flex items-center gap-3 text-lg text-primary">
                                        {section.image && (
                                            <Image
                                                src={section.image}
                                                alt={section.title || "Feature"}
                                                width={30}
                                                height={30}
                                                className="h-8 w-8 rounded-md object-cover"
                                            />
                                        )}
                                        {section.title || "Specifications"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-2">
                                        {section.features && Array.isArray(section.features) && section.features.map(
                                            (featureItem, itemIndex, arr) => (
                                                <div key={itemIndex}>
                                                    <div className="flex justify-between items-start gap-4">
                                                        <span className="font-medium text-sm text-gray-700 min-w-0 shrink-0">
                                                            {featureItem.key}
                                                        </span>
                                                        <span className="text-sm text-gray-900 text-right min-w-0 flex-1">
                                                            {featureItem.value}
                                                        </span>
                                                    </div>
                                                    {itemIndex < arr.length - 1 && (
                                                        <div className="mt-2 border border-primary/20" />
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-center bg-red-50 py-12 rounded-lg text-red-500">
                        No features available
                    </p>
                )}
            </div>
        </div>
    );
}
