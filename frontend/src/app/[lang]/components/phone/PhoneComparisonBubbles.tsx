// components/PhoneComparisonBubbles.tsx
import React from 'react';
import Link from 'next/link';


// Define props for the PhoneComparisonBubbles component
interface PhoneComparisonBubblesProps {
    lang: 'fr' | 'es' | 'en'; // Define supported languages
}

const PhoneComparisonBubbles: React.FC<PhoneComparisonBubblesProps> = ({ lang }) => {
    const getComparisonLink = (phone1: string, phone2: string) => {
        const phone1Formatted = phone1.replace(/ /g, '-');
        const phone2Formatted = phone2.replace(/ /g, '-');

        return `/${lang}/phone/compare/${phone1Formatted}-vs-${phone2Formatted}`;
    };

    // Translations for the title and subtitles based on the language
    const translations = {
        en: {
            title: 'Popular Phone Comparisons',
            subtitle: 'Here are some of the popular phone comparisons of late.',
        },
        fr: {
            title: 'Comparaisons de téléphones populaires',
            subtitle: 'Voici quelques-unes des comparaisons de téléphones populaires récemment.',
        },
        es: {
            title: 'Comparaciones populares de teléfonos',
            subtitle: 'Aquí hay algunas de las comparaciones de teléfonos más populares últimamente.',
        },
    };

    const phoneComparisons = [
        { phone: 'Oppo K3 vs Oppo Reno2 F' },
        { phone: 'LG G7 ThinQ vs OnePlus 8' },
        { phone: 'Motorola Moto G14 vs Motorola Moto G54 5G' },
        { phone: 'Apple iPhone XR vs Samsung Galaxy A03s' },
        { phone: 'Apple iPhone 14 Pro vs Apple iPhone 15 Pro' },
        { phone: 'Honor Magic 7 Pro vs Oppo Find X6 Pro' },
        { phone: 'Apple iPhone 13 vs Samsung Galaxy S24' },
        { phone: 'Apple iPhone 7 vs Apple iPhone 7 Plus' },
        { phone: 'Oppo Find X6 Pro vs Xiaomi Redmi Note 13 Pro' },
    ];

    return (
        <div className='py-10'>
            <h2 className="text-2xl font-bold text-center mb-4">{translations[lang].title}</h2>
            <p className="text-center mb-6">{translations[lang].subtitle}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {phoneComparisons.map((comparison, index) => {
                    const phone1 = comparison.phone.split(' vs ')[0]; // Split phone names
                    const phone2 = comparison.phone.split(' vs ')[1]; // Split phone names

                    return (
                        <div key={index} className="flex flex-col items-center border rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
                            <Link href={getComparisonLink(phone1, phone2)} className="text-center">
                                <h3 className="text-xl font-semibold">{phone1}</h3>
                                <span className="text-gray-500">vs</span>
                                <h3 className="text-xl font-semibold">{phone2}</h3>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PhoneComparisonBubbles;
