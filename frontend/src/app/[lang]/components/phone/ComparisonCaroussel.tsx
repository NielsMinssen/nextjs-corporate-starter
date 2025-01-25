"use client";

import React, { useMemo } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./../carousel";

interface CarouselProps {
    phoneList: string[];
    phone1: string;
    phone2: string;
    translations: Translation;
    lang: "fr" | "es" | "en";
}

const ComparisonCarousel: React.FC<CarouselProps> = ({ phoneList, phone1, phone2, translations, lang }) => {
    const extractBasePhone = (phone: string) => phone.split(/\s+(?:\d+GB|\d+\s*GB\s*RAM)/)[0].trim();

    const createCanonicalUrl = (phone1: string, phone2: string) => {
        const [base1, base2] = [phone1, phone2].map(phone =>
            extractBasePhone(phone).replace(/\s+/g, "-")
        ).sort();
        return `${process.env.NEXT_PUBLIC_STRAPI_URL}/${lang}/phone/compare/${base1}-vs-${base2}`;
    };

    const filterCanonicalPhones = useMemo(() => {
        const canonicalSet = new Set<string>();
        return phoneList.filter(phone => {
            const basePhone = extractBasePhone(phone);
            if (canonicalSet.has(basePhone)) return false;
            canonicalSet.add(basePhone);
            return true;
        });
    }, [phoneList]);

    const comparisons = useMemo(() => {
        const canonicalSet = new Set<string>();
        const alternateComparisons: { phone1: string; phone2: string }[] = [];

        filterCanonicalPhones.forEach((phone, index) => {
            if (extractBasePhone(phone1) !== extractBasePhone(phone) && extractBasePhone(phone2) !== extractBasePhone(phone)) {
                const alternatePhone1 = index % 2 === 0 ? phone1 : phone;
                const alternatePhone2 = index % 2 === 0 ? phone : phone2;

                const canonicalUrl = createCanonicalUrl(alternatePhone1, alternatePhone2);

                if (!canonicalSet.has(canonicalUrl)) {
                    canonicalSet.add(canonicalUrl);
                    alternateComparisons.push({ phone1: alternatePhone1, phone2: alternatePhone2 });
                }
            }
        });

        return alternateComparisons.slice(0, 10);
    }, [filterCanonicalPhones, phone1, phone2]);

    return (
        <div className="max-w-4xl mx-auto mt-6">
            <h2 className="text-2xl font-bold text-center mb-4">{translations.phoneComparison.comparisonCarousel.title}</h2>
            <Carousel className="relative">
                <CarouselContent className="flex md:gap-2">
                    {comparisons.map((comparison, index) => {
                        const canonicalUrl = createCanonicalUrl(comparison.phone1, comparison.phone2);
                        const [imageUrl1, imageUrl2] = [comparison.phone1, comparison.phone2].map(phone =>
                            `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/uploads/photosSmartphones/${extractBasePhone(phone).replace(/\s+/g, "-")}.webp`
                        );

                        return (
                            <CarouselItem
                                key={index}
                                className="shrink-0 basis-1/2 md:basis-1/3"
                            >
                                <a
                                    href={`${canonicalUrl}`}
                                    className="p-4 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col items-center"
                                >
                                    <div className="flex items-center justify-center mb-2">
                                        <img
                                            src={imageUrl1}
                                            alt={comparison.phone1}
                                            className="w-20 h-20 object-contain mr-1"
                                        />
                                        <span className="text-xl font-bold">vs</span>
                                        <img
                                            src={imageUrl2}
                                            alt={comparison.phone2}
                                            className="w-20 h-20 object-contain ml-1"
                                        />
                                    </div>
                                    <h3 className="text-sm text-center">
                                        {extractBasePhone(comparison.phone1)}
                                        <br />
                                        <strong>VS</strong>
                                        <br />
                                        {extractBasePhone(comparison.phone2)}
                                    </h3>
                                </a>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
                <CarouselPrevious className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-200 rounded-full p-2">
                </CarouselPrevious>
                <CarouselNext className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-200 rounded-full p-2">
                </CarouselNext>
            </Carousel>

        </div>
    );
};

export default ComparisonCarousel;
