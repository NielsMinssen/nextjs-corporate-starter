"use client";
import React, { useState } from 'react';
import Loader from "@/app/[lang]/components/Loader";
import PhoneComparisonBubbles from './PhoneComparisonBubbles';
import PhonePerformanceRadar from './PhonePerformanceRadar';
import { useComparison, usePhoneData } from '@/app/hooks/phone/usePhoneData';
import PhoneSelectors from './PhoneSelectors';
import ComparisonHeader from './ComparisonHeader';
import AccordionComparison from './AccordionComparison';

interface PhoneComparisonProps {
    initialPhone1: string;
    initialPhone2: string;
    lang: "fr" | "es" | "en";
}

const PhoneComparison: React.FC<PhoneComparisonProps> = ({ initialPhone1, initialPhone2, lang }) => {

    const [phone1, setPhone1] = useState<string>(initialPhone1);
    const [phone2, setPhone2] = useState<string>(initialPhone2);

    const { phoneList, translations, isLoading, error } = usePhoneData(lang);

    const {
        comparisonResult,
        comparisonAttributes,
        handleSelectChange,
    } = useComparison(phone1, phone2, phoneList, lang);

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }



    if (!translations || !comparisonResult) {
        return <div className="text-center">Data not available</div>;
    }


    const phoneOptions = phoneList.map((phone) => ({
        value: phone.brand_and_full_name,
        label: phone.brand_and_full_name,
        storage: phone.Performance.storage_options_gb,
        ram: phone.Performance.RAM_gb
    }));

    const phoneComparisons = [
        { phone: 'Apple iPhone 7 256GB vs POCO X6 Pro' },
    ];

    return (
        <div className="max-w-4xl mx-auto md:p-8 p-2 bg-white rounded-xl">
            <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">{translations.phoneComparison.title}</h1>
            <p className="text-xl mb-8 text-center text-gray-600">{translations.phoneComparison.description}</p>

            <PhoneSelectors phone1={phone1} phone2={phone2} phoneOptions={phoneOptions} handleSelectChange={handleSelectChange} setPhone1={setPhone1} setPhone2={setPhone2} />

            {/* <div className="text-center mb-10">
                <button
                    onClick={handleCompare}
                    disabled={!phone1 || !phone2}
                    className={`px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:-translate-y-1 ${(!phone1 || !phone2) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                        }`}
                >
                    {translations.phoneComparison.compareButton}
                </button>
            </div> */}

            <div className="overflow-x-auto bg-gray-50 rounded-xl px-1 md:p-6">
                {comparisonResult && (
                    <div className="overflow-x-auto bg-gray-50 rounded-xl px-1 md:p-6">
                        <ComparisonHeader comparisonResult={comparisonResult} comparisonAttributes={comparisonAttributes} translations={translations} />
                        <PhonePerformanceRadar
                            phone1={comparisonResult[0]}
                            phone2={comparisonResult[1]}
                            comparisonAttributes={comparisonAttributes}
                            comparisonResult={comparisonResult}
                            translations={translations}
                        />
                        <AccordionComparison comparisonResult={comparisonResult} comparisonAttributes={comparisonAttributes} translations={translations} />
                    </div>
                )}
            </div>
            <PhoneComparisonBubbles comparisons={phoneComparisons} lang={lang} />
        </div >
    );
};

export default PhoneComparison;