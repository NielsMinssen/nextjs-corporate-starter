import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../Accordion';
import {
    Smartphone,
    Monitor,
    Cpu,
    Camera,
    Settings2,
    Battery,
    Volume2,
    ListPlus,
    CheckCircle,
    XCircle,
    HelpCircle,
} from 'lucide-react';
import { getAttributeComparisonPercentage, getBarStyle } from '../../utils/phone/comparisonCalculations';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';

const AccordionComparison = ({ comparisonResult, comparisonAttributes, translations }: {
    comparisonResult: [PhoneSpecs, PhoneSpecs];
    comparisonAttributes: (keyof PhoneSpecs)[];
    translations: Translation
}) => {
    return (
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
                                                    <td colSpan={2} className="py-2 text-sm font-semibold text-gray-700">
                                                        {<Popover>
                                                            <PopoverTrigger asChild>
                                                                <span className="flex cursor-pointer underline">
                                                                    <>{(translations.phoneComparison.details[attribute] as any)[subAttribute]?.title || subAttribute}</>
                                                                </span>
                                                            </PopoverTrigger>
                                                            <PopoverContent>
                                                                <p>{(translations.phoneComparison.details[attribute] as any)[subAttribute]?.description}</p>
                                                            </PopoverContent>
                                                        </Popover>}
                                                    </td>
                                                </tr>
                                                <tr className="border-b border-gray-200 hover:bg-gray-100 transition duration-150 ease-in-out">
                                                    <td className="hidden md:flex md:items-center px-6 py-4 text-sm font-semibold text-gray-700">
                                                        {<Popover>
                                                            <PopoverTrigger asChild>
                                                                <span className="flex items-center cursor-pointer underline">
                                                                    <>{(translations.phoneComparison.details[attribute] as any)[subAttribute]?.title || subAttribute}</>
                                                                </span>
                                                            </PopoverTrigger>
                                                            <PopoverContent>
                                                                <p>{(translations.phoneComparison.details[attribute] as any)[subAttribute]?.description}</p>
                                                            </PopoverContent>
                                                        </Popover>}
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
    );
};

export default AccordionComparison;
