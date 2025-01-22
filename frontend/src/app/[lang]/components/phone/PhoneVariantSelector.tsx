import React, { useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface Variant {
    storage: number;
    ram: number;
    fullName: string;
}

interface PhoneVariantSelectorProps {
    phoneOptions: { value: string; label: string; storage: number; ram: number }[];
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

        const basePhoneName = phoneName.split(/\s+(?:\d+GB|\d+\s*GB\s*RAM)/)[0].trim();

        return phoneOptions
            .filter(option => option.value.startsWith(basePhoneName))
            .map(option => ({
                fullName: option.value,
                storage: option.storage,
                ram: option.ram
            }));
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
                    className={`px-3 py-1 text-sm rounded-full border transition-colors
            ${variant.fullName === selectedPhone
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                >
                    {variant.storage}GB / {variant.ram}GB RAM
                </button>
            ))}
        </div>
    );
};

export default PhoneVariantSelector;
