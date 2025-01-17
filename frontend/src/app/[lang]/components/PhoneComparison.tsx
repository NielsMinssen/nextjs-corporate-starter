"use client";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Select, { SingleValue } from "react-select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/[lang]/components/tooltip";
import { CheckCircle, HelpCircle, XCircle } from "lucide-react";
import Loader from "@/app/[lang]/components/Loader";
import PhoneComparisonBubbles from './PhoneComparisonBubbles';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/[lang]/components/Accordion";
// import PhonePerformanceRadar from './PhonePerformanceRadar';
// import DetailSection from './PhoneDetailSection';
// import PhoneDetailSection from './PhoneDetailSection';

interface PhoneSpecs {
    brand_and_full_name: string;
    Design: {
        weight_g: number;
        thickness_mm: number;
        width_mm: number;
        height_mm: number;
        water_resistance: string;
        IP_rating: string;
        volume_cm3: number;
    };
    Screen: {
        screen_size_in: number;
        screen_type: string;
        pixel_density_ppi: number;
        resolution: string;
        refresh_rate_hz: number;
        typical_brightness_nits: number;
        HDR10_compatible: boolean;
        Dolby_Vision_compatible: boolean;
    };
    Performance: {
        storage_options_gb: number;
        RAM_gb: number;
        AnTuTu_benchmark_score: number;
        GPU_name: string;
        processor_speed_ghz: number;
        RAM_speed_mhz: number;
        semiconductor_size_nm: number;
        supports_64_bit: boolean;
        uses_big_LITTLE_technology: boolean;
        processor_threads: number;
        supports_ECC_memory: boolean;
        max_memory_size_gb: number;
        uses_multithreading: boolean;
    };
    Cameras: {
        main_camera_megapixels: number;
        front_camera_megapixels: number;
        built_in_optical_image_stabilization: boolean;
        video_recording: string;
        largest_aperture_f: number;
        continuous_autofocus_during_video_recording: boolean;
        can_record_slow_motion_videos: boolean;
        IGD_mode: boolean;
        flash: boolean;
        optical_zoom_x: number;
        CMOS_sensor: boolean;
        manual_ISO: boolean;
        burst_mode: boolean;
        manual_focus: boolean;
        front_camera: boolean;
        manual_white_balance: boolean;
        takes_raw_images: boolean;
        AF_touch: boolean;
        manual_shutter_speed: boolean;
        in_camera_panoramas: boolean;
        large_aperture_front_camera_f: number;
        Dolby_Vision_recording: boolean;
    };
    Operating_System: {
        Android_version: string;
        clipboard_warning_message: boolean;
        location_privacy_options: boolean;
        camera_and_microphone_privacy_options: boolean;
        theme_customization: boolean;
        dark_mode: boolean;
        WiFi_password_sharing: boolean;
        battery_health_check: boolean;
        extra_dim_mode: boolean;
        Focus_mode: boolean;
        dynamic_theming: boolean;
        offload_apps: boolean;
        customizable_notifications: boolean;
        live_text: boolean;
        SharePlay: boolean;
        screen_sharing: boolean;
        direct_OS_updates: boolean;
        AirPlay: boolean;
        more_languages: string;
        quick_start: boolean;
    };
    Battery: {
        battery_capacity_mAh: number;
        wireless_charging: boolean;
        fast_charging: boolean;
        charging_speed_w: number;
        wireless_charging_speed_w: number;
        battery_level_indicator: boolean;
        battery_life_h: number;
    };
    Audio: {
        built_in_stereo_speaker: boolean;
        aptX: boolean;
        LDAC: boolean;
        aptX_HD: boolean;
    };
    Features: {
        supports_5G: boolean;
        WiFi_version: string;
        download_speed_mbps: number;
        upload_speed_mbps: number;
        USB_Type_C_ports: boolean;
        USB_version: string;
        NFC_device: boolean;
        SIM_cards: string;
        fingerprint_reader: boolean;
        emergency_communication_via_satellite: boolean;
        detects_car_accidents: boolean;
        Bluetooth_version: string;
        gyroscope: boolean;
        GPS: boolean;
        compass: boolean;
        WiFi_compatible: boolean;
        infrared_sensor: boolean;
        accelerometer: boolean;
        barometer: boolean;
        supports_Galileo: boolean;
    };
}

interface Translation {
    phoneComparison: {
        title: string;
        description: string;
        selectPhone1: string;
        selectPhone2: string;
        select: string;
        compareButton: string;
        attribute: string;
        bothequal: string;
        is: string;
        betterthan: string;
        basedon: string;
        buyonamazon: string;
        amazondisclaimer: string;
        details: {
            [key: string]: string;
        };
        tooltips: {
            [key: string]: string;
        };
        [key: string]: string | { [key: string]: string };
    };
}


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
                    console.log(phones);

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

    // const AttributeWithTooltip: React.FC<{ attribute: string }> = ({ attribute }) => {
    //     return (
    //         <TooltipProvider>
    //             <Tooltip>
    //                 <TooltipTrigger asChild>
    //                     <span className="flex items-center">
    //                         <HelpCircle className="ml-1 h-4 w-4 text-gray-400" />
    //                     </span>
    //                 </TooltipTrigger>
    //                 <TooltipContent>
    //                     <p>{translations.phoneComparison.tooltips[attribute] || "No description available"}</p>
    //                 </TooltipContent>
    //             </Tooltip>
    //         </TooltipProvider>
    //     );
    // };

    const comparisonAttributes: (keyof PhoneSpecs)[] = [
        "Design",
        "Screen",
        "Performance",
        "Cameras",
        "Operating_System",
        "Battery",
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
    } => {
        if (!comparisonResult) {
            return {
                betterPhone: null,
                worsePhone: null,
                percentageDifference: null,
                isEqual: false,
            };
        }

        let totalImprovement = 0;
        let totalAttributes = 0;

        // Sum up the percentage differences for each attribute
        comparisonAttributes.forEach((attribute) => {
            const comparison = getAttributeComparisonPercentage(attribute);
            if (comparison.percentageDifference !== null) {
                const difference = comparison.betterPhone === comparisonResult[0].brand_and_full_name
                    ? comparison.percentageDifference
                    : -comparison.percentageDifference;

                totalImprovement += difference;
                totalAttributes++;
            } else {
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
            };
        }

        const averageImprovement = totalImprovement / totalAttributes;

        // If the difference is negligible, consider them equal
        if (Math.abs(averageImprovement) < 0.01) {
            return {
                betterPhone: null,
                worsePhone: null,
                percentageDifference: null,
                isEqual: true,
            };
        }

        // Return the comparison result based on the average improvement
        return {
            betterPhone: averageImprovement > 0
                ? comparisonResult[0].brand_and_full_name
                : comparisonResult[1].brand_and_full_name,
            worsePhone: averageImprovement > 0
                ? comparisonResult[1].brand_and_full_name
                : comparisonResult[0].brand_and_full_name,
            percentageDifference: Number(Math.abs(averageImprovement).toFixed(2)),
            isEqual: false,
        };
    };

    const getAttributeComparisonPercentage = (attribute: keyof PhoneSpecs): {
        betterPhone: string | null,
        worsePhone: string | null,
        percentageDifference: number | null,
        isEqual: boolean
    } => {
        if (!comparisonResult) return { betterPhone: null, worsePhone: null, percentageDifference: null, isEqual: false };

        let totalImprovement = 0;
        let totalAttributesCounted = 0;

        const calculateImprovement = (value1: number, value2: number, lowerIsBetter: boolean) => {
            if (lowerIsBetter) {
                if (value1 < value2) {
                    return ((value2 - value1) / value2) * 100;
                } else if (value2 < value1) {
                    return -((value1 - value2) / value1) * 100;
                }
            } else {
                if (value1 > value2) {
                    return ((value1 - value2) / value2) * 100;
                } else if (value2 > value1) {
                    return -((value2 - value1) / value1) * 100;
                }
            }
            return 0;
        };

        Object.keys(comparisonResult[0][attribute]).forEach((subAttribute) => {
            if (neutralAttributes.includes(`${attribute}.${subAttribute}`)) return;

            const value1 = (comparisonResult[0][attribute] as any)[subAttribute];
            const value2 = (comparisonResult[1][attribute] as any)[subAttribute];
            const lowerIsBetter = attributesWhereLowerIsBetter.includes(`${attribute}.${subAttribute}`);

            if (value1 != null && value2 != null) {
                if (typeof value1 === 'number' && typeof value2 === 'number' && value1 !== 0 && value2 !== 0) {
                    const improvementPercentage = calculateImprovement(value1, value2, lowerIsBetter);
                    totalImprovement += improvementPercentage;
                    totalAttributesCounted++;
                } else if (typeof value1 === 'boolean' && typeof value2 === 'boolean') {
                    if (value1 !== value2) {
                        totalImprovement += value1 ? 100 : -100;
                        totalAttributesCounted++;
                    }
                }
            }
        });

        if (totalAttributesCounted === 0) {
            return { betterPhone: null, worsePhone: null, percentageDifference: null, isEqual: true };
        }

        const averageImprovement = totalImprovement / totalAttributesCounted;

        if (averageImprovement > 0) {
            return {
                betterPhone: comparisonResult[0].brand_and_full_name,
                worsePhone: comparisonResult[1].brand_and_full_name,
                percentageDifference: Number(averageImprovement.toFixed(2)),
                isEqual: false
            };
        } else {
            return {
                betterPhone: comparisonResult[1].brand_and_full_name,
                worsePhone: comparisonResult[0].brand_and_full_name,
                percentageDifference: Number(Math.abs(averageImprovement).toFixed(2)),
                isEqual: false
            };
        }
    };

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
                                            <span className="text-green-600">{comparisonData.betterPhone}</span>
                                            {' '}
                                            {translations.phoneComparison.is}
                                            {' '}
                                            <span className="text-blue-600">{comparisonData.percentageDifference}%</span>
                                            {' '}
                                            {translations.phoneComparison.betterthan}
                                            {' '}
                                            <span className="text-red-600">{comparisonData.worsePhone}</span>
                                            {' '}
                                            {translations.phoneComparison.basedon}
                                        </>
                                    );
                                }
                            })()}
                        </div>
                        <div className="overflow-x-auto bg-gray-50 rounded-xl p-1 md:p-6">
                            {/* Mobile-friendly phone names header */}
                            <div className="md:hidden mb-4 flex justify-between font-bold text-sm text-gray-900">
                                <div className="w-1/2 px-2">{comparisonResult[0].brand_and_full_name}</div>
                                <div className="w-1/2 px-2">{comparisonResult[1].brand_and_full_name}</div>
                            </div>

                            <Accordion type="multiple" defaultValue={comparisonAttributes}>
                                {comparisonAttributes.map((attribute) => {
                                    const attributeComparison = getAttributeComparisonPercentage(attribute);
                                    return (
                                        <AccordionItem key={attribute} value={attribute}>
                                            <AccordionTrigger className="text-lg font-semibold hover:text-blue-600">
                                                {typeof translations.phoneComparison[attribute] === 'string' ? translations.phoneComparison[attribute] as string : attribute}
                                                {' '}
                                                {attributeComparison.isEqual ? (
                                                    <span className="text-gray-600">({translations.phoneComparison.bothequal})</span>
                                                ) : (
                                                    <>
                                                        <span className="text-green-600">{attributeComparison.betterPhone}</span>
                                                        {' '}
                                                        {translations.phoneComparison.is}
                                                        {' '}
                                                        <span className="text-blue-600">{attributeComparison.percentageDifference}%</span>
                                                        {' '}
                                                        {translations.phoneComparison.betterthan}
                                                        {' '}
                                                        <span className="text-red-600">{attributeComparison.worsePhone}</span>
                                                    </>
                                                )}
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-6">
                                                <table className="w-full table-fixed">
                                                    <thead className="hidden md:table-header-group">
                                                        <tr className="border-b-2 border-gray-200">
                                                            <th className="px-6 py-3 text-center text-sm font-bold text-gray-900 uppercase">
                                                                {translations.phoneComparison.attribute}
                                                            </th>
                                                            <th className="px-6 py-3 text-center text-sm font-bold text-gray-900 uppercase">
                                                                {comparisonResult[0].brand_and_full_name}
                                                            </th>
                                                            <th className="px-6 py-3 text-center text-sm font-bold text-gray-900 uppercase">
                                                                {comparisonResult[1].brand_and_full_name}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.keys(comparisonResult[0][attribute]).map((subAttribute) => (
                                                            <React.Fragment key={subAttribute}>
                                                                <tr className="md:hidden border-b border-gray-200 bg-gray-50">
                                                                    <td colSpan={2} className="px-6 py-2 text-sm font-semibold text-gray-700">
                                                                        <>{translations.phoneComparison.details[attribute][subAttribute]?.title || subAttribute}</>
                                                                    </td>
                                                                </tr>
                                                                <tr className="border-b border-gray-200 hover:bg-gray-100 transition duration-150 ease-in-out">
                                                                    <td className="hidden md:flex md:items-center px-6 py-4 text-sm font-semibold text-gray-700">
                                                                        <>{translations.phoneComparison.details[attribute][subAttribute]?.title || subAttribute}</>
                                                                        {/* <AttributeWithTooltip attribute={subAttribute} /> */}
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
            {/* {
        comparisonResult && (
            <PhonePerformanceRadar
                phone1={comparisonResult[0]}
                phone2={comparisonResult[1]}
                translations={translations}
            />
        )
    } */}
            <div className="my-8">
                <Accordion type="single" collapsible defaultValue='detail'>
                    <AccordionItem value="detail">
                        <AccordionTrigger className="text-lg font-semibold hover:text-blue-600">
                            {translations.phoneComparison.details.title}
                        </AccordionTrigger>
                        <AccordionContent className="space-y-6">
                            {/* {comparisonAttributes.map((attribute) => (
                                    <PhoneDetailSection
                                        key={attribute}
                                        attribute={attribute}
                                        translations={translations}
                                        phone1={comparisonResult[0]}
                                        phone2={comparisonResult[1]}
                                        numericAttributes={numericAttributes}
                                    />
                                ))} */}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            <PhoneComparisonBubbles comparisons={phoneComparisons} lang={userLanguage} />
        </div >
    );
};

export default PhoneComparison;