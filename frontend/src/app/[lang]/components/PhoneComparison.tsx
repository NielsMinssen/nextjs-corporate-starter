"use client";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Select, { SingleValue } from "react-select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/[lang]/components/tooltip";
import { Battery, Camera, CheckCircle, Cpu, HelpCircle, ListPlus, Monitor, Settings2, Smartphone, Volume2, XCircle } from "lucide-react";
import Loader from "@/app/[lang]/components/Loader";
import PhoneComparisonBubbles from './PhoneComparisonBubbles';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/[lang]/components/Accordion";
import PhonePerformanceRadar from './PhonePerformanceRadar';

interface PhoneComparisonProps {
    initialPhone1: string;
    initialPhone2: string;
    lang: string;
}

const PhoneComparison: React.FC<PhoneComparisonProps> = ({ initialPhone1, initialPhone2, lang }) => {
    const [phoneList, setPhoneList] = useState<PhoneSpecs[]>([]);
    const [phone1, setPhone1] = useState<string>(initialPhone1);
    const [phone2, setPhone2] = useState<string>(initialPhone2);
    const [comparisonResult, setComparisonResult] = useState<[PhoneSpecs, PhoneSpecs] | null>(null);
    const [translations, setTranslations] = useState<Translation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userLanguage, setUserLanguage] = useState<SupportedLanguage>('en'); // Default language
    const router = useRouter();

    // Define the type for supported languages
    type SupportedLanguage = 'fr' | 'es' | 'en';

    useEffect(() => {
        // Set userLanguage based on window.location
        const language = (window.location.pathname.split("/")[1] as SupportedLanguage) || 'en';
        setUserLanguage(language);
    }, []);

    const phoneComparisons = [
        { phone: 'Apple iPhone 7 256GB vs POCO X6 Pro' },
    ];

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
                    const phones = phonesData.data.map((item: any) => ({
                        id: item.id,
                        ...item.attributes.phone,
                    }));
                    setPhoneList(phones);

                    const selectedPhone1 = phones.find((phone: PhoneSpecs) => phone.brand_and_full_name === phone1);
                    const selectedPhone2 = phones.find((phone: PhoneSpecs) => phone.brand_and_full_name === phone2);

                    if (selectedPhone1 && selectedPhone2) {
                        setComparisonResult([selectedPhone1, selectedPhone2]);
                    } else {
                        throw new Error("One or both selected phones not found");
                    }
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

            router.push(`/${userLanguage}/phone/compare/${phone1Formatted}-vs-${phone2Formatted}`);
        }
    };

    const handleSelectChange = (
        selectedOption: SingleValue<{ value: string; label: string }>,
        setter: (value: string) => void
    ) => {
        if (selectedOption) {
            setter(selectedOption.value);
        }
    };

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
    }));


    const comparisonAttributes: (keyof PhoneSpecs)[] = [
        "Performance",
        "Cameras",
        "Battery",
        "Screen",
        "Design",
        "Operating_System",
        "Audio",
        "Features",
    ];

    const numericAttributes: (keyof PhoneSpecs)[] = [
        "Design.weight_g" as keyof PhoneSpecs,
        "Design.thickness_mm" as keyof PhoneSpecs,
        "Design.width_mm" as keyof PhoneSpecs,
        "Design.height_mm" as keyof PhoneSpecs,
        "Design.volume_cm3" as keyof PhoneSpecs,
        "Screen.screen_size_in" as keyof PhoneSpecs,
        "Screen.pixel_density_ppi" as keyof PhoneSpecs,
        "Screen.refresh_rate_hz" as keyof PhoneSpecs,
        "Screen.typical_brightness_nits" as keyof PhoneSpecs,
        "Performance.storage_options_gb" as keyof PhoneSpecs,
        "Performance.RAM_gb" as keyof PhoneSpecs,
        "Performance.AnTuTu_benchmark_score" as keyof PhoneSpecs,
        "Performance.processor_speed_ghz" as keyof PhoneSpecs,
        "Performance.RAM_speed_mhz" as keyof PhoneSpecs,
        "Performance.semiconductor_size_nm" as keyof PhoneSpecs,
        "Performance.processor_threads" as keyof PhoneSpecs,
        "Performance.max_memory_size_gb" as keyof PhoneSpecs,
        "Cameras.main_camera_megapixels" as keyof PhoneSpecs,
        "Cameras.front_camera_megapixels" as keyof PhoneSpecs,
        "Cameras.largest_aperture_f" as keyof PhoneSpecs,
        "Cameras.large_aperture_front_camera_f" as keyof PhoneSpecs,
        "Cameras.optical_zoom_x" as keyof PhoneSpecs,
        "Battery.battery_capacity_mAh" as keyof PhoneSpecs,
        "Battery.charging_speed_w" as keyof PhoneSpecs,
        "Battery.wireless_charging_speed_w" as keyof PhoneSpecs,
        "Battery.battery_life_h" as keyof PhoneSpecs,
        "Features.download_speed_mbps" as keyof PhoneSpecs,
        "Features.upload_speed_mbps" as keyof PhoneSpecs,
    ];

    const performanceAttributes: (keyof PhoneSpecs)[] = [
        "Performance.AnTuTu_benchmark_score" as keyof PhoneSpecs,
        "Performance.processor_speed_ghz" as keyof PhoneSpecs,
        "Performance.RAM_speed_mhz" as keyof PhoneSpecs,
        "Performance.semiconductor_size_nm" as keyof PhoneSpecs,
        "Performance.processor_threads" as keyof PhoneSpecs,
        "Performance.max_memory_size_gb" as keyof PhoneSpecs,
    ];

    // Attributes that are not necessarily better or worse based on their value
    const neutralAttributes = [
        "Design.width_mm",
        "Design.height_mm",
        "Design.volume_cm3",
        "Screen.screen_size_in",
    ];

    const attributesWhereLowerIsBetter = ["Design.weight_g", "Design.thickness_mm"];


    const getBarStyle = (attribute: keyof PhoneSpecs, subAttribute: string, index: number) => {
        if (!comparisonResult || !numericAttributes.includes(`${attribute}.${subAttribute}` as keyof PhoneSpecs)) return {};

        const value1 = (comparisonResult[0][attribute] as any)[subAttribute] as number;
        const value2 = (comparisonResult[1][attribute] as any)[subAttribute] as number;

        // If one of the values doesn't exist, use pastel blue for the other existing value
        if (value1 == null || value2 == null) {
            if (index === 0 && value1 != null) {
                return {
                    background: `linear-gradient(90deg, hsl(210, 50%, 80%) 100%, hsl(210, 50%, 80%) 100%)`, // pastel blue for the existing value
                };
            } else if (index === 1 && value2 != null) {
                return {
                    background: `linear-gradient(90deg, hsl(210, 50%, 80%) 100%, hsl(210, 50%, 80%) 100%)`, // pastel blue for the existing value
                };
            }
            return {}; // No styling if the value doesn't exist
        }

        // If values are the same, return full pastel blue for both
        if (value1 === value2) {
            return {
                background: `linear-gradient(90deg, hsl(210, 50%, 80%) 100%, hsl(210, 50%, 80%) 100%)`, // pastel blue for equal values
            };
        }


        const maxValue = Math.max(value1, value2);
        const minValue = Math.min(value1, value2);
        const currentValue = (comparisonResult[index][attribute] as any)[subAttribute] as number;
        const isBestValue = attributesWhereLowerIsBetter.includes(`${attribute}.${subAttribute}`) ? currentValue === minValue : currentValue === maxValue;
        const otherValue = (comparisonResult[1 - index][attribute] as any)[subAttribute] as number;

        // Determine the difference ratio
        const differenceRatio = Math.abs(currentValue - otherValue) / Math.max(maxValue, 1); // Avoid division by zero
        const percentage = (currentValue / maxValue) * 100;

        if (neutralAttributes.includes(`${attribute}.${subAttribute}`)) {
            return {
                background: `linear-gradient(90deg, hsl(210, 50%, 80%) ${percentage}%, transparent ${percentage}%)`, // pastel blue for neutral attributes
            };
        }

        // Base color for the best value (always green)
        let color = `hsl(120, 70%, 60%)`; // green

        if (!isBestValue) {
            // Color transitions from green (120 hue) to red (0 hue) based on how far the values are
            const hue = 100 - (differenceRatio * 120); // Shift hue from 120 (green) to 0 (red) based on the difference
            color = `hsl(${hue}, 70%, 60%)`; // Softened, pastel color
        }

        return {
            background: `linear-gradient(90deg, ${color} ${percentage}%, transparent ${percentage}%)`,
        };
    };

    const getOverallComparisonPercentage = (): {
        betterPhone: string | null,
        worsePhone: string | null,
        percentageDifference: number | null,
        isEqual: boolean,
        averageScorePhone1: number,
        averageScorePhone2: number
    } => {
        if (!comparisonResult) {
            return {
                betterPhone: null,
                worsePhone: null,
                percentageDifference: null,
                isEqual: false,
                averageScorePhone1: 0,
                averageScorePhone2: 0
            };
        }

        let totalScorePhone1 = 0;
        let totalScorePhone2 = 0;
        let totalAttributes = 0;

        // Sum up the normalized scores for each attribute
        comparisonAttributes.forEach((attribute) => {
            const comparison = getAttributeComparisonPercentage(attribute);
            if (comparison.scores.normalized[comparisonResult[0].brand_and_full_name] !== undefined &&
                comparison.scores.normalized[comparisonResult[1].brand_and_full_name] !== undefined) {
                totalScorePhone1 += comparison.scores.normalized[comparisonResult[0].brand_and_full_name];
                totalScorePhone2 += comparison.scores.normalized[comparisonResult[1].brand_and_full_name];
                totalAttributes++;
            }
        });

        // If no attributes were compared, return equal
        if (totalAttributes === 0) {
            return {
                betterPhone: null,
                worsePhone: null,
                percentageDifference: null,
                isEqual: true,
                averageScorePhone1: 0,
                averageScorePhone2: 0
            };
        }

        const averageScorePhone1 = totalScorePhone1 / totalAttributes;
        const averageScorePhone2 = totalScorePhone2 / totalAttributes;

        // If the difference is negligible, consider them equal
        if (Math.abs(averageScorePhone1 - averageScorePhone2) < 0.01) {
            return {
                betterPhone: null,
                worsePhone: null,
                percentageDifference: null,
                isEqual: true,
                averageScorePhone1: 0,
                averageScorePhone2: 0
            };
        }

        console.log(averageScorePhone1, averageScorePhone2)
        // Return the comparison result based on the average scores
        return {
            betterPhone: averageScorePhone1 > averageScorePhone2
                ? comparisonResult[0].brand_and_full_name
                : comparisonResult[1].brand_and_full_name,
            worsePhone: averageScorePhone1 > averageScorePhone2
                ? comparisonResult[1].brand_and_full_name
                : comparisonResult[0].brand_and_full_name,
            percentageDifference: Number(((Math.abs(averageScorePhone1 - averageScorePhone2) / Math.min(averageScorePhone1, averageScorePhone2)) * 100).toFixed(1)),
            isEqual: false,
            averageScorePhone1: Number(averageScorePhone1.toFixed(2)),
            averageScorePhone2: Number(averageScorePhone2.toFixed(2)),
        };
    };

    const getAttributeComparisonPercentage = (attribute: string): {
        betterPhone: string | null,
        worsePhone: string | null,
        percentageDifference: number | null,
        isEqual: boolean,
        scores: {
            normalized: { [phone: string]: number },
            notNormalized: { [phone: string]: number }
        },
    } => {
        const phoneAttribute = attribute as keyof PhoneSpecs;
        if (!comparisonResult) return {
            betterPhone: null,
            worsePhone: null,
            percentageDifference: null,
            isEqual: false,
            scores: {
                normalized: {},
                notNormalized: {}
            },
        };

        let totalScorePhone1 = 0;
        let totalScorePhone2 = 0;
        let totalMetrics = 0;

        const calculateScore = (value1: any, value2: any, subAttribute: string): [number, number] => {
            // For numeric values
            if (typeof value1 === 'number' && typeof value2 === 'number' && value1 !== 0 && value2 !== 0) {
                const maxValue = Math.max(value1, value2);
                const minValue = Math.min(value1, value2);

                if (neutralAttributes.includes(`${attribute}.${subAttribute}`)) {
                    return [0, 0]; // Neutral attributes do not contribute to the score
                }

                if (attributesWhereLowerIsBetter.includes(`${attribute}.${subAttribute}`)) {
                    const score1 = (minValue / value1) * 10;
                    const score2 = (minValue / value2) * 10;
                    return [score1, score2];
                } else {
                    const score1 = (value1 / maxValue) * 10;
                    const score2 = (value2 / maxValue) * 10;
                    return [score1, score2];
                }
            }

            // For boolean values
            if (typeof value1 === 'boolean' && typeof value2 === 'boolean') {
                const score1 = value1 ? 10 : 0;
                const score2 = value2 ? 10 : 0;
                return [score1, score2];
            }

            // For unknown values (?)
            if (value1 === '?' || value2 === '?') {
                return [0, 0]; // Average value for unknowns
            }

            return [0, 0]; // Default value
        };

        Object.keys(comparisonResult[0][phoneAttribute as keyof PhoneSpecs]).forEach((subAttribute) => {
            const value1 = (comparisonResult[0][phoneAttribute] as any)[subAttribute];
            const value2 = (comparisonResult[1][phoneAttribute] as any)[subAttribute];

            const [score1, score2] = calculateScore(value1, value2, subAttribute);
            if (score1 !== 0 || score2 !== 0) {
                totalScorePhone1 += score1;
                totalScorePhone2 += score2;
            }
            if ((typeof value1 === 'number' || typeof value1 === 'boolean') && !neutralAttributes.includes(`${attribute}.${subAttribute}`)) {
                totalMetrics += 1;
            }
        });

        if (totalMetrics === 0) {
            return {
                betterPhone: null,
                worsePhone: null,
                percentageDifference: null,
                isEqual: true,
                scores: {
                    normalized: {},
                    notNormalized: {}
                },
            };
        }

        // Calculate average scores
        const normalizedScorePhone1 = (totalScorePhone1 / totalMetrics * 10);
        const normalizedScorePhone2 = (totalScorePhone2 / totalMetrics * 10);

        const isEqual = Math.abs(normalizedScorePhone1 - normalizedScorePhone2) < 0.1;
        const betterPhone = normalizedScorePhone1 > normalizedScorePhone2
            ? comparisonResult[0].brand_and_full_name
            : comparisonResult[1].brand_and_full_name;
        const worsePhone = normalizedScorePhone1 < normalizedScorePhone2
            ? comparisonResult[0].brand_and_full_name
            : comparisonResult[1].brand_and_full_name;
        const percentageDifference = Math.abs(normalizedScorePhone1 - normalizedScorePhone2);

        return {
            betterPhone: isEqual ? null : betterPhone,
            worsePhone: isEqual ? null : worsePhone,
            percentageDifference: isEqual ? null : Number(percentageDifference.toFixed(2)),
            isEqual,
            scores: {
                normalized: {
                    [comparisonResult[0].brand_and_full_name]: normalizedScorePhone1,
                    [comparisonResult[1].brand_and_full_name]: normalizedScorePhone2
                },
                notNormalized: {
                    [comparisonResult[0].brand_and_full_name]: totalScorePhone1,
                    [comparisonResult[1].brand_and_full_name]: totalScorePhone2
                }
            },
        };
    };


    return (
        <div className="max-w-4xl mx-auto md:p-8 p-2 bg-white rounded-xl">
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

            <div className="overflow-x-auto bg-gray-50 rounded-xl px-1 md:p-6">
                {comparisonResult && (
                    <div className="overflow-x-auto bg-gray-50 rounded-xl px-1 md:p-6">
                        <div className="mt-6 pb-6 text-center text-xl font-semibold text-gray-800">
                            {(() => {
                                const comparisonData = getOverallComparisonPercentage();
                                if (comparisonData.isEqual) {
                                    return translations.phoneComparison.bothequal;
                                } else {
                                    return (
                                        <>
                                            <span className={comparisonData.betterPhone === comparisonResult[0].brand_and_full_name ? "text-[#b83f39]" : "text-[#514bbd]"}>
                                                {comparisonData.betterPhone}
                                            </span>
                                            {' '}
                                            {translations.phoneComparison.is}
                                            {' '}
                                            <span className="text-blue-600">{comparisonData.percentageDifference}%</span>
                                            {' '}
                                            {translations.phoneComparison.betterthan}
                                            {' '}
                                            <span className={comparisonData.worsePhone === comparisonResult[0].brand_and_full_name ? "text-[#b83f39]" : "text-[#514bbd]"}>
                                                {comparisonData.worsePhone}
                                            </span>
                                            {' '}
                                            {translations.phoneComparison.basedon}
                                        </>
                                    );
                                }
                            })()}
                        </div>
                        <PhonePerformanceRadar
                            phone1={comparisonResult[0]}
                            phone2={comparisonResult[1]}
                            comparisonAttributes={comparisonAttributes}
                            getOverallComparisonPercentage={getOverallComparisonPercentage()}
                            getAttributeComparisonPercentage={getAttributeComparisonPercentage}
                            translations={translations}
                        />
                        <div className="overflow-x-auto bg-gray-50 rounded-xl p-1 md:p-6">
                            <Accordion type="multiple" defaultValue={[comparisonAttributes[0]]}>
                                {comparisonAttributes.map((attribute) => {
                                    const attributeComparison = getAttributeComparisonPercentage(attribute);
                                    return (
                                        <AccordionItem key={attribute} value={attribute}>
                                            <AccordionTrigger className="text-lg font-semibold">
                                                <div className="flex w-full">
                                                    <div className="md:w-1/4 md:text-left flex pr-2 items-center">
                                                        {(() => {
                                                            switch (attribute) {
                                                                case "Design":
                                                                    return <Smartphone className="mr-2 h-5 w-5" />;
                                                                case "Screen":
                                                                    return <Monitor className="mr-2 h-5 w-5" />;
                                                                case "Performance":
                                                                    return <Cpu className="mr-2 h-5 w-5" />;
                                                                case "Cameras":
                                                                    return <Camera className="mr-2 h-5 w-5" />;
                                                                case "Operating_System":
                                                                    return <Settings2 className="mr-2 h-5 w-5" />;
                                                                case "Battery":
                                                                    return <Battery className="mr-2 h-5 w-5" />;
                                                                case "Audio":
                                                                    return <Volume2 className="mr-2 h-5 w-5" />;
                                                                case "Features":
                                                                    return <ListPlus className="mr-2 h-5 w-5" />;
                                                                default:
                                                                    return null;
                                                            }
                                                        })()}
                                                        {translations.phoneComparison.details[attribute]?.title || attribute}
                                                    </div>
                                                    <div className="md:w-3/4 md:text-left flex-1">
                                                        {attributeComparison.isEqual ? (
                                                            <div className="text-base font-normal">
                                                                <span className="font-normal">{translations.phoneComparison.equivalent}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-base font-normal">
                                                                <span className={attributeComparison.betterPhone === comparisonResult[0].brand_and_full_name ? "text-[#b83f39]" : "text-[#514bbd]"}>
                                                                    {attributeComparison.betterPhone}
                                                                </span>
                                                                {' '}
                                                                <span className="font-normal">{translations.phoneComparison.is}</span>
                                                                {' '}
                                                                <span className="font-normal">{translations.phoneComparison.betterthan}</span>
                                                                {' '}
                                                                <span className={attributeComparison.worsePhone === comparisonResult[0].brand_and_full_name ? "text-[#b83f39]" : "text-[#514bbd]"}>
                                                                    {attributeComparison.worsePhone}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-6">
                                                {/* Mobile-friendly phone names header */}
                                                <div className="md:hidden mb-4 flex justify-between font-bold text-sm text-gray-900">
                                                    <div className="w-1/2 text-center px-2">{comparisonResult[0].brand_and_full_name}
                                                        <div className={"text-[#b83f39]"}>
                                                            {attributeComparison.scores && attributeComparison.scores.normalized[comparisonResult[0].brand_and_full_name] ?
                                                                `${attributeComparison.scores.normalized[comparisonResult[0].brand_and_full_name].toFixed(0)} ${translations.phoneComparison.points}` : ''}
                                                        </div>
                                                    </div>
                                                    <div className="w-1/2 text-center px-2">{comparisonResult[1].brand_and_full_name}
                                                        <div className={"text-[#514bbd]"}>
                                                            {attributeComparison.scores && attributeComparison.scores.normalized[comparisonResult[1].brand_and_full_name] ?
                                                                `${attributeComparison.scores.normalized[comparisonResult[1].brand_and_full_name].toFixed(0)} ${translations.phoneComparison.points}` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                                <table className="w-full table-fixed">
                                                    <thead className="hidden md:table-header-group">
                                                        <tr className="border-b-2 border-gray-200">
                                                            <th className="px-6 py-3 text-center text-sm font-bold text-gray-900 uppercase">
                                                                {translations.phoneComparison.attribute}
                                                            </th>
                                                            <th className="px-6 py-3 text-center text-sm font-bold text-gray-900 ">
                                                                {comparisonResult[0].brand_and_full_name}
                                                                <div className={"text-[#b83f39]"}>
                                                                    {attributeComparison.scores && attributeComparison.scores.normalized[comparisonResult[0].brand_and_full_name] ?
                                                                        `${attributeComparison.scores.normalized[comparisonResult[0].brand_and_full_name].toFixed(0)} ${translations.phoneComparison.points}` : ''}
                                                                </div>
                                                            </th>
                                                            <th className="px-6 py-3 text-center text-sm font-bold text-gray-900 ">
                                                                {comparisonResult[1].brand_and_full_name}
                                                                <div className={"text-[#514bbd]"}>
                                                                    {attributeComparison.scores && attributeComparison.scores.normalized[comparisonResult[1].brand_and_full_name] ?
                                                                        `${attributeComparison.scores.normalized[comparisonResult[1].brand_and_full_name].toFixed(0)} ${translations.phoneComparison.points}` : ''}
                                                                </div>
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.keys(comparisonResult[0][attribute]).map((subAttribute) => (
                                                            <React.Fragment key={subAttribute}>
                                                                <tr className="md:hidden border-b border-gray-200 bg-gray-50">
                                                                    <td colSpan={2} className="px-6 py-2 text-sm font-semibold text-gray-700">
                                                                        <>{(translations.phoneComparison.details[attribute] as any)[subAttribute]?.title || subAttribute}</>
                                                                    </td>
                                                                </tr>
                                                                <tr className="border-b border-gray-200 hover:bg-gray-100 transition duration-150 ease-in-out">
                                                                    <td className="hidden md:flex md:items-center px-6 py-4 text-sm font-semibold text-gray-700">
                                                                        {<TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <span className="flex items-center cursor-pointer">
                                                                                        <>{(translations.phoneComparison.details[attribute] as any)[subAttribute]?.title || subAttribute}</>
                                                                                    </span>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>{(translations.phoneComparison.details[attribute] as any)[subAttribute]?.description}</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>}
                                                                    </td>
                                                                    <td
                                                                        className="px-6 py-4 text-sm text-gray-600 text-center"
                                                                        style={getBarStyle(attribute, subAttribute as keyof PhoneSpecs, 0)}
                                                                    >
                                                                        {typeof (comparisonResult[0][attribute] as any)[subAttribute] === 'boolean'
                                                                            ? (comparisonResult[0][attribute] as any)[subAttribute]
                                                                                ? <span className="text-green-600"><CheckCircle className="inline-block h-5 w-5" /></span>
                                                                                : <span className="text-red-600"><XCircle className="inline-block h-5 w-5" /></span>
                                                                            : (comparisonResult[0][attribute] as any)[subAttribute] ?? <span className="text-gray-400"><HelpCircle className="inline-block h-5 w-5" /></span>}
                                                                    </td>
                                                                    <td
                                                                        className="px-6 py-4 text-sm text-gray-600 text-center"
                                                                        style={getBarStyle(attribute, subAttribute as keyof PhoneSpecs, 1)}
                                                                    >
                                                                        {typeof (comparisonResult[1][attribute] as any)[subAttribute] === 'boolean'
                                                                            ? (comparisonResult[1][attribute] as any)[subAttribute]
                                                                                ? <span className="text-green-600"><CheckCircle className="inline-block h-5 w-5" /></span>
                                                                                : <span className="text-red-600"><XCircle className="inline-block h-5 w-5" /></span>
                                                                            : (comparisonResult[1][attribute] as any)[subAttribute] ?? <span className="text-gray-400"><HelpCircle className="inline-block h-5 w-5" /></span>}
                                                                    </td>
                                                                </tr>
                                                            </React.Fragment>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        </div>
                    </div>
                )}
            </div>
            <PhoneComparisonBubbles comparisons={phoneComparisons} lang={userLanguage} />
        </div >
    );
};

export default PhoneComparison;