import { Banknote, Gauge, Zap, Cpu, Battery, Bolt, Calendar, HardDrive, Tag } from 'lucide-react';

const AttributeBar = ({ value, maxValue, color }: { value: number, maxValue: number, color: string }) => {
    const percentage = (value / maxValue) * 100;

    return (
        <div className="w-full bg-gray-50 h-4 rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                    width: `${percentage}%`,
                    backgroundColor: color
                }}
            />
        </div>
    );
};

const getAttributeIcon = (attribute: string) => {
    const icons = {
        price: <Banknote className="w-6 h-6" />,
        g3d_mark: <Gauge className="w-6 h-6" />,
        videocard_value: <Zap className="w-6 h-6" />,
        g2d_mark: <Cpu className="w-6 h-6" />,
        tdp: <Battery className="w-6 h-6" />,
        power_perf: <Bolt className="w-6 h-6" />,
        vram: <HardDrive className="w-6 h-6" />,
        test_date: <Calendar className="w-6 h-6" />,
        category: <Tag className="w-6 h-6" />
    } as const;

    return icons[attribute as keyof typeof icons] || null;
};

const GPUDetailSection = ({
    attribute,
    translations,
    gpu1,
    gpu2,
    numericAttributes
}: {
    attribute: string;
    translations: any;
    gpu1: any;
    gpu2: any;
    numericAttributes: string[];
}) => {
    const isNumeric = numericAttributes.includes(attribute);
    const maxValue = isNumeric ? Math.max(gpu1[attribute], gpu2[attribute]) : 0;

    return (
        <div key={attribute} className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                {getAttributeIcon(attribute)}
                <div className="text-2xl font-bold text-gray-800">
                    {translations.gpuComparison.details[attribute].title}
                </div>
            </div>

            <div className="mt-2 text-gray-600">
                <div className="space-y-1">
                    {Object.entries(translations.gpuComparison.details[attribute]).map(
                        ([key, value], index) => (
                            key !== "title" && (
                                <span key={`value-${key}-${index}`} className="block">
                                    {value as string}
                                </span>
                            )
                        )
                    )}
                </div>
            </div>

            <div className="mt-4 space-y-4">
                <div className="space-y-2">
                    <div className="font-semibold" style={{ color: "#8884d8" }}>
                        {gpu1.videocard_name}
                    </div>
                    {isNumeric ? (
                        <div className="flex items-center gap-4">
                            <AttributeBar
                                value={gpu1[attribute]}
                                maxValue={maxValue}
                                color="#8884d8"
                            />
                            <span className="w-20 text-right font-bold">{gpu1[attribute]}</span>
                        </div>
                    ) : attribute === 'test_date' ? (
                        <div className="relative w-full h-12">
                            <div className="absolute w-full h-1 bg-gray-200 top-1/2 -translate-y-1/2" />
                            {[gpu1, gpu2].map((gpu, index) => {
                                const date = new Date(gpu[attribute]);
                                const dates = [new Date(gpu1[attribute]), new Date(gpu2[attribute])];
                                const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
                                const endDate = new Date(Math.max(...dates.map(d => d.getTime())));

                                // Add 6 months padding before and after
                                startDate.setMonth(startDate.getMonth() - 6);
                                endDate.setMonth(endDate.getMonth() + 6);

                                const percentage = ((date.getTime() - startDate.getTime()) /
                                    (endDate.getTime() - startDate.getTime())) * 100;

                                return (
                                    <div
                                        key={gpu.videocard_name}
                                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                                        style={{
                                            left: `${percentage}%`,
                                            backgroundColor: index === 0 ? '#8884d8' : '#82ca9d',
                                            transform: `translate(-50%, -50%)`,
                                        }}
                                    >
                                        <div
                                            className="absolute whitespace-nowrap"
                                            style={{
                                                color: index === 0 ? '#8884d8' : '#82ca9d',
                                                top: index === 0 ? '-1.5rem' : '1.5rem',
                                            }}
                                        >
                                            {gpu[attribute]}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div>{gpu1[attribute]}</div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="font-semibold" style={{ color: "#82ca9d" }}>
                        {gpu2.videocard_name}
                    </div>
                    {isNumeric ? (
                        <div className="flex items-center gap-4">
                            <AttributeBar
                                value={gpu2[attribute]}
                                maxValue={maxValue}
                                color="#82ca9d"
                            />
                            <span className="w-20 text-right font-bold">{gpu2[attribute]}</span>
                        </div>
                    ) : attribute === 'test_date' ? null : (
                        <div>{gpu2[attribute]}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GPUDetailSection;