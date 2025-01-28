"use client";
import React, { useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface Variant {
    storage: number;
    ram: number;
    fullName: string;
}

interface PhoneVariantSelectorProps {
    phoneOptions: { brand_and_full_name: string; RAM_gb: number; storage_options_gb: number; }[];
    selectedPhone: string;
    otherPhone: string;
    position: 1 | 2;
}

const PhoneVariantSelector: React.FC<PhoneVariantSelectorProps> = ({
    phoneOptions,
    selectedPhone,
    otherPhone,
    position,
}) => {
    const router = useRouter();
    const pathname = usePathname();

    const getVariants = (phoneName: string): Variant[] => {
        if (!phoneName) return [];

        // Extraire le nom de base sans ram et stockage
        const basePhoneName = phoneName.split(/\s+(?:\d+GB|\d+\s*GB\s*RAM)/)[0].trim();

        // Expression régulière stricte pour éviter les variantes non désirées
        const exactModelRegex = new RegExp(
            `^${basePhoneName}(?:\\s(?:\\d+GB|\\d+GB\\sRAM))*$`, // Accepte uniquement le modèle exact suivi de RAM/stockage
            'i'
        );

        return phoneOptions
            .filter(option => exactModelRegex.test(option.brand_and_full_name)) // Correspond uniquement au modèle exact
            .map(option => ({
                fullName: option.brand_and_full_name,
                storage: option.storage_options_gb,
                ram: option.RAM_gb,
            }))
            .sort((a, b) => {
                // Trier d'abord par stockage, puis par RAM
                if (a.storage !== b.storage) {
                    return a.storage - b.storage;
                }
                return a.ram - b.ram;
            });
    };



    const variants = useMemo(() => getVariants(selectedPhone), [selectedPhone, phoneOptions]);

    const handleVariantClick = (variant: Variant) => {
        const phone1 = position === 1 ? variant.fullName : otherPhone;
        const phone2 = position === 2 ? variant.fullName : otherPhone;
        const comparison = `${phone1.replace(/\s+/g, '-')}-vs-${phone2.replace(/\s+/g, '-')}`;

        // Get the base path up to 'compare'
        const basePath = pathname.split('/compare')[0];
        const newPath = `${basePath}/compare/${comparison}`;

        router.push(newPath);
    };

    if (variants.length <= 1) return null;

    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((variant, index) => (
                <button
                    key={index}
                    onClick={() => handleVariantClick(variant)}
                    className={`px-3 py-1 text-sm rounded-md border transition-all text-xs
      ${variant.fullName === selectedPhone
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-black hover:text-black'
                        }`}
                >
                    {variant.storage}GB / {variant.ram}GB RAM
                </button>
            ))}
        </div>

    );
};

export default PhoneVariantSelector;
