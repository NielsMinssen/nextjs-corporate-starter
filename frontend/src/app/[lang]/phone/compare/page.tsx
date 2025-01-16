"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Select, { SingleValue } from "react-select";
import Loader from "../../components/Loader";
import PhoneComparisonBubbles from "../../components/PhoneComparisonBubbles";
import { useLanguage } from "../../components/LanguageContext";

interface Phone {
    id: number;
    brand_and_full_name: string;
}

interface Translation {
    phoneComparison: {
        title: string;
        description: string;
        selectPhone1: string;
        selectPhone2: string;
        compareButton: string;
        [key: string]: string;
    };
}

const PhonePage: React.FC = () => {
    const [phoneList, setPhoneList] = useState<Phone[]>([]);
    const [phone1, setPhone1] = useState<string | null>(null);
    const [phone2, setPhone2] = useState<string | null>(null);
    const [translations, setTranslations] = useState<Translation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const lang = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [translationsResponse, phonesResponse] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/phonedescription?locale=${lang}`),
                    fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/phones`)
                ]);

                if (!translationsResponse.ok || !phonesResponse.ok) {
                    throw new Error("One or more network responses were not ok");
                }

                const translationsData = await translationsResponse.json();
                const phonesData = await phonesResponse.json();

                if (translationsData.data && translationsData.data.attributes) {
                    setTranslations(translationsData.data.attributes.phonedescription);
                } else {
                    throw new Error("Invalid translations data structure");
                }

                if (phonesData.data) {
                    setPhoneList(
                        phonesData.data.map((item: any) => ({
                            id: item.id,
                            brand_and_full_name: item.attributes.phone.brand_and_full_name,
                        }))
                    );
                } else {
                    throw new Error("Invalid phone data structure");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("An error occurred while fetching data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [lang]);

    const handleCompare = () => {
        if (phone1 && phone2) {
            const phone1Formatted = phone1.replace(/ /g, '-');
            const phone2Formatted = phone2.replace(/ /g, '-');

            router.push(`/${lang}/phone/compare/${phone1Formatted}-vs-${phone2Formatted}`);
        }
    };

    const handleSelectChange = (
        selectedOption: SingleValue<{ value: string; label: string }>,
        setter: (value: string | null) => void
    ) => {
        setter(selectedOption ? selectedOption.value : null);
    };

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    if (!translations) {
        return <div className="text-center">Translations not available</div>;
    }

    const phoneOptions = phoneList.map((phone) => ({
        value: phone.brand_and_full_name,
        label: phone.brand_and_full_name,
    }));

    const phoneComparisons = [
        { phone: 'Apple iPhone 7 256GB vs POCO X6 Pro' },
    ];

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl">
            <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">{translations.phoneComparison.title}</h1>
            <p className="text-xl mb-8 text-center text-gray-600">{translations.phoneComparison.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations.phoneComparison.selectPhone1}
                    </label>
                    <Select
                        value={phoneOptions.find((option) => option.value === phone1) || null}
                        onChange={(option) => handleSelectChange(option, setPhone1)}
                        options={phoneOptions}
                        isClearable
                        classNamePrefix="react-select"
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations.phoneComparison.selectPhone2}
                    </label>
                    <Select
                        value={phoneOptions.find((option) => option.value === phone2) || null}
                        onChange={(option) => handleSelectChange(option, setPhone2)}
                        options={phoneOptions}
                        isClearable
                        classNamePrefix="react-select"
                        className="w-full"
                    />
                </div>
            </div>

            <div className="text-center mb-10">
                <button
                    onClick={handleCompare}
                    disabled={!phone1 || !phone2}
                    className={`px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:-translate-y-1 ${(!phone1 || !phone2) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                        }`}
                >
                    {translations.phoneComparison.compareButton}
                </button>
            </div>
            <PhoneComparisonBubbles comparisons={phoneComparisons} lang={lang} />
        </div>
    );
};

export default PhonePage;
