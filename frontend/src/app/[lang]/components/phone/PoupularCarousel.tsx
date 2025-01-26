"use client";

import React, { useMemo } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../carousel";

interface PopularCarouselProps {
    translations: Translation;
    lang: "fr" | "es" | "en";
}

const phoneComparisons = [
    { phone1: "Oppo K3", phone2: "Oppo Reno2 F" },
    { phone1: "LG G7 ThinQ", phone2: "OnePlus 8" },
    { phone1: "Motorola Moto G14", phone2: "Motorola Moto G54 5G" },
    { phone1: "Apple iPhone XR", phone2: "Samsung Galaxy A03s" },
    { phone1: "Apple iPhone 14 Pro", phone2: "Apple iPhone 15 Pro" },
    { phone1: "Honor Magic 7 Pro", phone2: "Oppo Find X6 Pro" },
    { phone1: "Apple iPhone 13", phone2: "Samsung Galaxy S24" },
    { phone1: "Apple iPhone 7", phone2: "Apple iPhone 7 Plus" },
    { phone1: "Oppo Find X6 Pro", phone2: "Xiaomi Redmi Note 13 Pro" },
];

const PopularCarousel: React.FC<PopularCarouselProps> = ({ lang, translations }) => {
    const createCanonicalUrl = (phone1: string, phone2: string) => {
        const formatToHyphenated = (phone: string) => phone.replace(/\s+/g, "-");
        return `${process.env.NEXT_PUBLIC_STRAPI_URL}/${lang}/phone/compare/${formatToHyphenated(phone1)}-vs-${formatToHyphenated(phone2)}`;
    };

    const extractBasePhone = (phone: string) => phone;

    return (
        <div className="max-w-4xl mx-auto mt-6">
            <h2 className="text-2xl font-bold text-center mb-6">{translations.phoneComparison.popularCarousel.title}</h2>
            <Carousel className="relative">
                <CarouselContent className="flex md:gap-2">
                    {phoneComparisons.map((comparison, index) => {
                        const canonicalUrl = createCanonicalUrl(comparison.phone1, comparison.phone2);
                        const [imageUrl1, imageUrl2] = [comparison.phone1, comparison.phone2].map(phone =>
                            `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/uploads/photosSmartphones/${phone.replace(/\s+/g, "-")}.webp`
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

export default PopularCarousel;
