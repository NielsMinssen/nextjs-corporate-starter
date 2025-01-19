import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import { getAttributeComparisonPercentage, getOverallComparisonPercentage } from '../utils/comparisonCalculations';


interface PhonePerformanceRadarProps {
    phone1: PhoneSpecs;
    phone2: PhoneSpecs;
    comparisonResult: [PhoneSpecs, PhoneSpecs] | null;
    comparisonAttributes: (keyof PhoneSpecs)[];
    translations: Translation;
}

const PhoneComparison: React.FC<PhonePerformanceRadarProps> = ({
    phone1,
    phone2,
    comparisonAttributes,
    comparisonResult,
    translations
}) => {
    const data = comparisonAttributes.map((attribute) => {
        const comparison = getAttributeComparisonPercentage(attribute, comparisonResult);
        const phone1Value = comparison.scores.normalized[phone1.brand_and_full_name];
        const phone2Value = comparison.scores.normalized[phone2.brand_and_full_name];

        return {
            subject: translations.phoneComparison.details[attribute].title,
            [phone1.brand_and_full_name]: phone1Value,
            [phone2.brand_and_full_name]: phone2Value,
            fullMark: 100,
            actualComparison: {
                difference: comparison.percentageDifference,
                betterPhone: comparison.betterPhone,
                isEqual: comparison.isEqual
            }
        };
    });

    const averageScorePhone1 = getOverallComparisonPercentage(comparisonResult, comparisonAttributes).averageScorePhone1;
    const averageScorePhone2 = getOverallComparisonPercentage(comparisonResult, comparisonAttributes).averageScorePhone2;

    return (
        <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-6 relative pt-20">
                <div className="absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center">
                    <div className="flex items-center mb-2 w-full flex-col">
                        <div className="w-1/3 md:w-1/6">
                            <CircularProgressbarWithChildren
                                value={averageScorePhone1}
                                maxValue={100}
                                styles={buildStyles({
                                    pathColor: '#b83f39',
                                    textColor: '#b83f39',
                                    trailColor: '#d6d6d6',
                                })}
                            >
                                <div className="text-xs font-bold text-center">
                                    {`${averageScorePhone1.toFixed(0)}`}<br />
                                    {translations.phoneComparison.points}
                                </div>
                            </CircularProgressbarWithChildren>
                        </div>
                        <span className="text-[#b83f39] font-bold pt-2">{phone1.brand_and_full_name}</span>
                    </div>
                    <img
                        src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/uploads/${decodeURI(phone1.brand_and_full_name.replace(/\s+/g, '-'))}.webp`}
                        alt={phone1.brand_and_full_name}
                        className="w-full h-full object-contain opacity-20"
                    />
                </div>

                <div className="absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center">
                    <div className="flex items-center mb-2 w-full flex-col">
                        <div className="w-1/3 md:w-1/6">
                            <CircularProgressbarWithChildren
                                value={averageScorePhone2}
                                maxValue={100}
                                styles={buildStyles({
                                    pathColor: '#514bbd',
                                    textColor: '#514bbd',
                                    trailColor: '#d6d6d6',
                                })}
                            >
                                <div className="text-xs font-bold text-center">
                                    {`${averageScorePhone2.toFixed(0)}`}<br />
                                    {translations.phoneComparison.points}
                                </div>
                            </CircularProgressbarWithChildren>
                        </div>
                        <span className="text-[#514bbd] font-bold pt-2">{phone2.brand_and_full_name}</span>
                    </div>
                    <img
                        src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/uploads/${decodeURI(phone2.brand_and_full_name.replace(/\s+/g, '-'))}.webp`}
                        alt={phone2.brand_and_full_name}
                        className="w-full h-full object-contain opacity-20"
                    />
                </div>

                <ResponsiveContainer width="100%" height={400}>
                    <RadarChart
                        width={850}
                        height={400}
                        data={data}
                        margin={{ top: 10, right: 48, bottom: 10, left: 45 }}
                        className="mx-auto"
                    >
                        <PolarGrid />
                        <PolarAngleAxis
                            dataKey="subject"
                            orientation="outer"
                            tick={{
                                fontSize: typeof window !== 'undefined' ? (window.innerWidth >= 768 ? 16 : 10) : 16,
                                fontWeight: 'bold',
                                fill: 'black',
                                dy: 5
                            }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={1} />
                        <Radar
                            name={phone1.brand_and_full_name}
                            dataKey={phone1.brand_and_full_name}
                            stroke="#b83f39"
                            fill="#b83f39"
                            fillOpacity={0.5}
                            strokeWidth={2}
                        />
                        <Radar
                            name={phone2.brand_and_full_name}
                            dataKey={phone2.brand_and_full_name}
                            stroke="#514bbd"
                            fill="#514bbd"
                            fillOpacity={0.5}
                            strokeWidth={2}
                        />
                        <Tooltip
                            labelFormatter={(label) => label}
                            formatter={(value: any, name: string) => {
                                const comparisonText = value.toFixed(2) + ' ' + translations.phoneComparison.points;
                                return [comparisonText, name];
                            }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PhoneComparison;