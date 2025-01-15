import {
    Cpu,
    Banknote,
    Gauge,
    Zap,
    Battery,
    Bolt,
    Calendar,
    Network,
    Tag,
    Layers
} from 'lucide-react';

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
        cpu_name: <Cpu className="w-6 h-6" />,
        num_sockets: <Network className="w-6 h-6" />,
        cores: <Layers className="w-6 h-6" />,
        price: <Banknote className="w-6 h-6" />,
        cpu_mark: <Gauge className="w-6 h-6" />,
        cpu_value: <Zap className="w-6 h-6" />,
        thread_mark: <Gauge className="w-6 h-6" />,
        thread_value: <Zap className="w-6 h-6" />,
        tdp: <Battery className="w-6 h-6" />,
        power_perf: <Bolt className="w-6 h-6" />,
        test_date: <Calendar className="w-6 h-6" />,
        socket: <Network className="w-6 h-6" />,
        category: <Tag className="w-6 h-6" />
    } as const;

    return icons[attribute as keyof typeof icons] || null;
};

const CPUDetailSection = ({
    attribute,
    translations,
    cpu1,
    cpu2,
    numericAttributes = [
        'num_sockets',
        'cores',
        'price',
        'cpu_mark',
        'cpu_value',
        'thread_mark',
        'thread_value',
        'tdp',
        'power_perf'
    ]
}: {
    attribute: string;
    translations: any;
    cpu1: any;
    cpu2: any;
    numericAttributes?: string[];
}) => {
    const isNumeric = numericAttributes.includes(attribute);
    const maxValue = isNumeric ? Math.max(
        cpu1[attribute] || 0,
        cpu2[attribute] || 0
    ) : 0;

    return (
        <div key={attribute} className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                {getAttributeIcon(attribute)}
                <div className="text-2xl font-bold text-gray-800">
                    {translations.cpuComparison.details[attribute].title}
                </div>
            </div>

            <div className="mt-2 text-gray-600">
                <div className="space-y-1">
                    {Object.entries(translations.cpuComparison.details[attribute]).map(
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
                        {cpu1.cpu_name}
                    </div>
                    {isNumeric ? (
                        cpu1[attribute] !== null ? (
                            <div className="flex items-center gap-4">
                                <AttributeBar
                                    value={cpu1[attribute]}
                                    maxValue={maxValue}
                                    color="#8884d8"
                                />
                                <span className="w-20 text-right font-bold">{cpu1[attribute]}</span>
                            </div>
                        ) : (
                            <div className="text-gray-500">No data available</div>
                        )
                    ) : attribute === 'test_date' ? (
                        <div className="relative w-full h-12">
                            <div className="absolute w-full h-1 bg-gray-200 top-1/2 -translate-y-1/2" />
                            {[cpu1, cpu2].map((cpu, index) => {
                                const date = new Date(cpu[attribute]);
                                const dates = [new Date(cpu1[attribute]), new Date(cpu2[attribute])];
                                const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
                                const endDate = new Date(Math.max(...dates.map(d => d.getTime())));

                                startDate.setMonth(startDate.getMonth() - 6);
                                endDate.setMonth(endDate.getMonth() + 6);

                                const percentage = ((date.getTime() - startDate.getTime()) /
                                    (endDate.getTime() - startDate.getTime())) * 100;

                                return (
                                    <div
                                        key={cpu.cpu_name}
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
                                            {cpu[attribute]}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div>{cpu1[attribute]}</div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="font-semibold" style={{ color: "#82ca9d" }}>
                        {cpu2.cpu_name}
                    </div>
                    {isNumeric ? (
                        cpu2[attribute] !== null ? (
                            <div className="flex items-center gap-4">
                                <AttributeBar
                                    value={cpu2[attribute]}
                                    maxValue={maxValue}
                                    color="#82ca9d"
                                />
                                <span className="w-20 text-right font-bold">{cpu2[attribute]}</span>
                            </div>
                        ) : (
                            <div className="text-gray-500">No data available</div>
                        )
                    ) : attribute === 'test_date' ? null : (
                        <div>{cpu2[attribute]}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CPUDetailSection;