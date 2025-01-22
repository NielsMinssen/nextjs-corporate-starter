import { useState, useEffect } from 'react';
export const usePhoneData = (lang: string) => {
    const [phoneList, setPhoneList] = useState<PhoneSpecs[]>([]);
    const [translations, setTranslations] = useState<Translation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

                if (translationsData.data?.attributes) {
                    setTranslations(translationsData.data.attributes.phonedescription);
                } else {
                    throw new Error("Invalid translations data structure");
                }

                if (phonesData.data) {
                    const phones = phonesData.data.map((item: any) => ({
                        id: item.id,
                        ...item.attributes.phone,
                    }));
                    setPhoneList(phones);
                } else {
                    throw new Error("Invalid phone data structure");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [lang]);

    return { phoneList, translations, isLoading, error };
};

import { SingleValue } from "react-select";
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export const useComparison = (phone1: string, phone2: string, phoneList: PhoneSpecs[], lang: string) => {
    const router = useRouter();
    const [comparisonResult, setComparisonResult] = useState<[PhoneSpecs, PhoneSpecs] | null>(null);

    const comparisonAttributes: (keyof PhoneSpecs)[] = useMemo(() => [
        "Performance",
        "Cameras",
        "Battery",
        "Screen",
        "Operating_System",
        "Design",
        "Audio",
        "Features",
    ], []);

    useEffect(() => {
        const selectedPhone1 = phoneList.find((phone) => phone.brand_and_full_name === phone1);
        const selectedPhone2 = phoneList.find((phone) => phone.brand_and_full_name === phone2);

        if (selectedPhone1 && selectedPhone2) {
            setComparisonResult([selectedPhone1, selectedPhone2]);
        }
    }, [phone1, phone2, phoneList]);

    useEffect(() => {
        if (phone1 && phone2) {
            const phone1Formatted = phone1.replace(/ /g, '-');
            const phone2Formatted = phone2.replace(/ /g, '-');

            router.push(`/${lang}/phone/compare/${phone1Formatted}-vs-${phone2Formatted}`);
        }
    }, [phone1, phone2, lang, router]);

    const handleSelectChange = (
        selectedOption: SingleValue<{ value: string; label: string }>,
        setter: (value: string) => void
    ) => {
        if (selectedOption) {
            setter(selectedOption.value);
        }
    };

    return {
        comparisonResult,
        comparisonAttributes,
        handleSelectChange,
    };
};


type SupportedLanguage = 'fr' | 'es' | 'en';

export const useLanguage = () => {
    const [userLanguage, setUserLanguage] = useState<SupportedLanguage>('en');

    useEffect(() => {
        // Get language from URL path if running in browser
        if (typeof window !== 'undefined') {
            const pathLanguage = window.location.pathname.split("/")[1] as SupportedLanguage;
            setUserLanguage(pathLanguage || 'en');
        }
    }, []);

    // Update language when URL changes
    useEffect(() => {
        const handleRouteChange = () => {
            const pathLanguage = window.location.pathname.split("/")[1] as SupportedLanguage;
            setUserLanguage(pathLanguage || 'en');
        };

        window.addEventListener('popstate', handleRouteChange);
        return () => window.removeEventListener('popstate', handleRouteChange);
    }, []);

    return userLanguage;
};