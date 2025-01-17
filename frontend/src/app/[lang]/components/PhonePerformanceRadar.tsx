import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PhoneSpecs {
    // Add other spec properties as needed
    brand_and_full_name: string;
}

interface ComparisonResult {
    betterPhone: string | null;
    worsePhone: string | null;
    percentageDifference: number | null;
    isEqual: boolean;
}

interface PhonePerformanceRadarProps {
    phone1: PhoneSpecs;
    phone2: PhoneSpecs;
    comparisonAttributes: string[];
    getAttributeComparisonPercentage: (attribute: string) => ComparisonResult;
}

const PhonePerformanceRadar: React.FC<PhonePerformanceRadarProps> = ({
    phone1,
    phone2,
    comparisonAttributes,
    getAttributeComparisonPercentage,
}) => {
    const data = comparisonAttributes.map((attribute) => {
        const comparison = getAttributeComparisonPercentage(attribute);
        let phone1Value = 100;
        let phone2Value = 100;

        if (!comparison.isEqual && comparison.percentageDifference !== null) {
            if (comparison.betterPhone === phone1.brand_and_full_name) {
                phone2Value = 100 - comparison.percentageDifference;
            } else {
                phone1Value = 100 - comparison.percentageDifference;
            }
        }

        return {
            subject: attribute.charAt(0).toUpperCase() + attribute.slice(1).replace(/_/g, ' '),
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
        <div className="bg-gray-50 rounded-xl p-6 my-4">
            <ResponsiveContainer width="100%" height={500}>
                <RadarChart
                    width={650}
                    height={400}
                    data={data}
                    margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                    className="mx-auto"
                >
                    <PolarGrid />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fontSize: 12 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} />
                    <Radar
                        name={phone1.brand_and_full_name}
                        dataKey={phone1.brand_and_full_name}
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0}
                        strokeWidth={2}
                    />
                    <Radar
                        name={phone2.brand_and_full_name}
                        dataKey={phone2.brand_and_full_name}
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0}
                        strokeWidth={2}
                    />
                    <Tooltip
                        labelFormatter={(label) => label}
                        formatter={(value: any, name: string, props: any) => {
                            const payload = props.payload;
                            const comparison = payload.actualComparison;

                            if (comparison.isEqual) {
                                return [`${value.toFixed(2)}% (Equal)`, name];
                            }

                            const isBetter = comparison.betterPhone === name;
                            const difference = comparison.difference;
                            const comparisonText = isBetter
                                ? `${value.toFixed(2)}% (Better by ${difference}%)`
                                : `${value.toFixed(2)}% (Worse by ${difference}%)`;

                            return [comparisonText, name];
                        }}
                    />
                    <Legend />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PhonePerformanceRadar;