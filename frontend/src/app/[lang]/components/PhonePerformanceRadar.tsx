import { Trophy } from 'lucide-react';
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';

interface PhonePerformanceRadarProps {
    phone1: PhoneSpecs;
    phone2: PhoneSpecs;
    comparisonAttributes: string[];
    getOverallComparisonPercentage: {
        betterPhone: string | null,
        worsePhone: string | null,
        percentageDifference: number | null,
        isEqual: boolean,
        averageScorePhone1: number,
        averageScorePhone2: number
    };
    getAttributeComparisonPercentage(attribute: string): {
        betterPhone: string | null,
        worsePhone: string | null,
        percentageDifference: number | null,
        isEqual: boolean,
        scores: {
            normalized: { [phone: string]: number },
            notNormalized: { [phone: string]: number }
        },
    }
    translations: Translation;
}

const PhonePerformanceRadar: React.FC<PhonePerformanceRadarProps> = ({
    phone1,
    phone2,
    comparisonAttributes,
    getOverallComparisonPercentage,
    getAttributeComparisonPercentage,
    translations
}) => {
    const winningPhone = getOverallComparisonPercentage.isEqual ? null : getOverallComparisonPercentage.betterPhone;

    const data = comparisonAttributes.map((attribute) => {
        const comparison = getAttributeComparisonPercentage(attribute);
        let phone1Value = comparison.scores.normalized[phone1.brand_and_full_name];
        let phone2Value = comparison.scores.normalized[phone2.brand_and_full_name];

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

    return (
        <div className="bg-gray-50 rounded-xl p-6 relative pt-20">
            <div className="absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center">
                <div className="flex items-center mb-2 w-full flex-col">
                    <div className="w-1/3 md:w-1/6">
                        <CircularProgressbarWithChildren
                            value={getOverallComparisonPercentage.averageScorePhone1}
                            maxValue={100}
                            styles={buildStyles({
                                pathColor: '#b83f39',
                                textColor: '#b83f39',
                                trailColor: '#d6d6d6',
                            })}
                        >
                            <div style={{ fontSize: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                                {`${getOverallComparisonPercentage.averageScorePhone1.toFixed(0)}`}<br />
                                {translations.phoneComparison.points}
                            </div>
                        </CircularProgressbarWithChildren >
                    </div>
                    <span className="text-[#b83f39] font-bold pt-2">{phone1.brand_and_full_name}</span>
                </div>
                <img src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/uploads/${decodeURI(phone1.brand_and_full_name.replace(/\s+/g, '-'))}.webp`} alt={phone1.brand_and_full_name} className="w-full h-full object-contain opacity-20" />
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center">
                <div className="flex items-center mb-2 w-full flex-col">
                    <div className="w-1/3 md:w-1/6">
                        <CircularProgressbarWithChildren
                            value={getOverallComparisonPercentage.averageScorePhone2}
                            maxValue={100}
                            styles={buildStyles({
                                pathColor: '#514bbd',
                                textColor: '#514bbd',
                                trailColor: '#d6d6d6',
                            })}
                        >
                            <div style={{ fontSize: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                                {`${getOverallComparisonPercentage.averageScorePhone2.toFixed(0)}`}<br />
                                {translations.phoneComparison.points}
                            </div>
                        </CircularProgressbarWithChildren >
                    </div>
                    <span className="text-[#514bbd] font-bold p">{phone2.brand_and_full_name}</span>
                </div>
                <img src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/uploads/${decodeURI(phone2.brand_and_full_name.replace(/\s+/g, '-'))}.webp`} alt={phone2.brand_and_full_name} className="w-full h-full object-contain opacity-20" />
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
                        orientation='outer'
                        tick={{
                            fontSize: window?.innerWidth >= 768 ? 16 : 10,
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
    );
};

export default PhonePerformanceRadar;