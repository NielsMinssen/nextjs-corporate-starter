import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GPU {
    id: number;
    videocard_name: string;
    price: number | null;
    g3d_mark: number;
    videocard_value: number | null;
    g2d_mark: number;
    tdp: number | null;
    power_perf: number | null;
    vram: number | null;
    test_date: string;
    category: string;
    amazonLink?: string;
}

interface Translation {
    gpuComparison: {
        title: string;
        description: string;
        selectGPU1: string;
        selectGPU2: string;
        select: string;
        compareButton: string;
        attribute: string;
        videocard_name: string;
        price: string;
        g3d_mark: string;
        videocard_value: string;
        g2d_mark: string;
        tdp: string;
        power_perf: string;
        vram: string;
        test_date: string;
        category: string;
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

interface GPUPerformanceRadarProps {
    gpu1: GPU;
    gpu2: GPU;
    translations: Translation;
}

const normalizeValue = (value: number | null, max: number): number => {
    if (value === null || max === 0) return 0;
    return (value / max) * 100;
};

const formatValue = (value: number | null): string => {
    return value === null ? 'N/A' : value.toFixed(2);
};

const GPUPerformanceRadar: React.FC<GPUPerformanceRadarProps> = ({ gpu1, gpu2, translations }) => {
    const comparisonAttributes: (keyof GPU)[] = [
        "price",
        "g3d_mark",
        "videocard_value",
        "g2d_mark",
        "tdp",
        "power_perf",
        "vram",
    ];

    const maxValues = comparisonAttributes.reduce((acc, key) => {
        const value1 = gpu1[key] as number | null;
        const value2 = gpu2[key] as number | null;
        acc[key] = Math.max(value1 || 0, value2 || 0);
        return acc;
    }, {} as Record<string, number>);

    const data = comparisonAttributes.map((key) => {
        return {
            subject: translations.gpuComparison[key] || key.replace(/_/g, ' ').toUpperCase(),
            [gpu1.videocard_name]: normalizeValue(gpu1[key] as number | null, maxValues[key]),
            [gpu2.videocard_name]: normalizeValue(gpu2[key] as number | null, maxValues[key]),
            fullMark: 100,
            actualValues: {
                [gpu1.videocard_name]: gpu1[key],
                [gpu2.videocard_name]: gpu2[key]
            }
        };
    });

    return (
        <div className="bg-gray-50 rounded-xl shadow-lg p-6 my-4">
            <ResponsiveContainer width="100%" height={400}>
                <RadarChart
                    width={650}
                    height={400}
                    data={data}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    className="mx-auto"
                >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} />
                    <Radar
                        name={gpu1.videocard_name}
                        dataKey={gpu1.videocard_name}
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0}
                        strokeWidth={2}
                    />
                    <Radar
                        name={gpu2.videocard_name}
                        dataKey={gpu2.videocard_name}
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0}
                        strokeWidth={2}
                    />
                    <Tooltip
                        labelFormatter={(label) => label}
                        formatter={(value: any, name: string, props: any) => {
                            const payload = props.payload;
                            const actualValue = payload?.actualValues?.[name] ?? 'N/A';
                            const normalizedValue = typeof value === 'number' ? value.toFixed(2) : value;
                            return [
                                `${actualValue} (Normalized: ${normalizedValue})`,
                                name
                            ];
                        }}
                    />
                    <Legend />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GPUPerformanceRadar;
