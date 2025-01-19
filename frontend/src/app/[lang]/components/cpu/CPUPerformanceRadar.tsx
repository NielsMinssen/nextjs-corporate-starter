import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CPU {
    id: number;
    cpu_name: string;
    num_sockets: number;
    cores: number;
    price: number | null;
    cpu_mark: number;
    cpu_value: number | null;
    thread_mark: number;
    thread_value: number | null;
    tdp: number | null;
    power_perf: number | null;
    test_date: string;
    socket: string;
    category: string;
    amazonLink?: string;
}

interface Translation {
    cpuComparison: {
        title: string;
        description: string;
        selectCPU1: string;
        selectCPU2: string;
        select: string;
        compareButton: string;
        attribute: string;
        cpu_name: string;
        num_sockets: string;
        cores: string;
        price: string;
        cpu_mark: string;
        cpu_value: string;
        thread_mark: string;
        thread_value: string;
        tdp: string;
        power_perf: string;
        test_date: string;
        socket: string;
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

interface CPUPerformanceRadarProps {
    cpu1: CPU;
    cpu2: CPU;
    translations: Translation;
}

const normalizeValue = (value: number | null, max: number): number => {
    if (value === null || max === 0) return 0;
    return (value / max) * 100;
};

const formatValue = (value: number | null): string => {
    return value === null ? 'N/A' : value.toFixed(2);
};

const CPUPerformanceRadar: React.FC<CPUPerformanceRadarProps> = ({ cpu1, cpu2, translations }) => {
    const comparisonAttributes: (keyof CPU)[] = [
        "num_sockets",
        "cores",
        "price",
        "cpu_mark",
        "cpu_value",
        "thread_mark",
        "thread_value",
        "tdp",
        "power_perf"
    ];

    // 2. Construire un objet de valeurs maximales pour chaque attribut
    const maxValues = comparisonAttributes.reduce((acc, key) => {
        const value1 = cpu1[key] as number | null;
        const value2 = cpu2[key] as number | null;
        acc[key] = Math.max(value1 || 0, value2 || 0);
        return acc;
    }, {} as Record<string, number>);

    // 3. Construire dynamiquement les données pour le graphique
    const data = comparisonAttributes.map((key) => {
        return {
            subject: translations.cpuComparison[key] || key.replace(/_/g, ' ').toUpperCase(), // Nom traduit
            [cpu1.cpu_name]: normalizeValue(cpu1[key] as number | null, maxValues[key]),
            [cpu2.cpu_name]: normalizeValue(cpu2[key] as number | null, maxValues[key]),
            fullMark: 100,
            actualValues: {
                [cpu1.cpu_name]: cpu1[key],
                [cpu2.cpu_name]: cpu2[key]
            }
        };
    });

    return (
        <div className="bg-gray-50 rounded-xl shadow-lg p-6 my-4">
            <ResponsiveContainer width="100%" height={400}>
                <RadarChart
                    width={650}
                    height={500}
                    data={data}
                    margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                    className="mx-auto"
                >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} />
                    <Radar
                        name={cpu1.cpu_name}
                        dataKey={cpu1.cpu_name}
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0}
                        strokeWidth={2}
                    />
                    <Radar
                        name={cpu2.cpu_name}
                        dataKey={cpu2.cpu_name}
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

export default CPUPerformanceRadar;