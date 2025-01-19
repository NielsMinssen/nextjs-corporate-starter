"use client";
import React, { useState } from 'react';
import Select from "react-select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/[lang]/components/tooltip";
import { Battery, Camera, CheckCircle, Cpu, HelpCircle, ListPlus, Monitor, Settings2, Smartphone, Volume2, XCircle } from "lucide-react";
import Loader from "@/app/[lang]/components/Loader";
import PhoneComparisonBubbles from './PhoneComparisonBubbles';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/[lang]/components/Accordion";
import PhonePerformanceRadar from './PhonePerformanceRadar';
import { useComparison, usePhoneData } from '@/app/hooks/phone/usePhoneData';
import { getAttributeComparisonPercentage, getBarStyle, getOverallComparisonPercentage } from '../utils/phone/comparisonCalculations';

interface PhoneComparisonProps {
    initialPhone1: string;
    initialPhone2: string;
    lang: "fr" | "es" | "en";
}

const PhoneComparison: React.FC<PhoneComparisonProps> = ({ initialPhone1, initialPhone2, lang }) => {
    const [phone1, setPhone1] = useState<string>(initialPhone1);
    const [phone2, setPhone2] = useState<string>(initialPhone2);

    const phoneComparisons = [
        { phone: 'Apple iPhone 7 256GB vs POCO X6 Pro' },
    ];

    const { phoneList, translations, isLoading, error } = usePhoneData(lang);
    const {
        comparisonResult,
        comparisonAttributes,
        handleSelectChange,
        handleCompare,
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
    }));



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
                                const comparisonData = getOverallComparisonPercentage(comparisonResult, comparisonAttributes);
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
                            comparisonResult={comparisonResult}
                            translations={translations}
                        />
                        <div className="overflow-x-auto bg-gray-50 rounded-xl p-1 md:p-6">
                            <Accordion type="multiple" defaultValue={[comparisonAttributes[0]]}>
                                {comparisonAttributes.map((attribute) => {
                                    const attributeComparison = getAttributeComparisonPercentage(attribute, comparisonResult);
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
                                                                        style={getBarStyle(attribute, subAttribute as keyof PhoneSpecs, 0, comparisonResult)}
                                                                    >
                                                                        {typeof (comparisonResult[0][attribute] as any)[subAttribute] === 'boolean'
                                                                            ? (comparisonResult[0][attribute] as any)[subAttribute]
                                                                                ? <span className="text-green-600"><CheckCircle className="inline-block h-5 w-5" /></span>
                                                                                : <span className="text-red-600"><XCircle className="inline-block h-5 w-5" /></span>
                                                                            : (comparisonResult[0][attribute] as any)[subAttribute] ?? <span className="text-gray-400"><HelpCircle className="inline-block h-5 w-5" /></span>}
                                                                    </td>
                                                                    <td
                                                                        className="px-6 py-4 text-sm text-gray-600 text-center"
                                                                        style={getBarStyle(attribute, subAttribute as keyof PhoneSpecs, 1, comparisonResult)}
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
            <PhoneComparisonBubbles comparisons={phoneComparisons} lang={lang} />
        </div >
    );
};

export default PhoneComparison;