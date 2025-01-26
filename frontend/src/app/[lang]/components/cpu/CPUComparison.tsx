"use client";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Select, { SingleValue } from "react-select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/[lang]/components/tooltip";
import { HelpCircle } from "lucide-react";
import Loader from "@/app/[lang]/components/Loader";
import CPUComparisonBubbles from './CPUComparisonBubbles';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/[lang]/components/Accordion";
import CPUPerformanceRadar from '@/app/[lang]/components/cpu/CPUPerformanceRadar';
import CPUDetailSection from './CPUDetailSection';

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

const AttributeWithTooltip: React.FC<{ attribute: string; translations: Translation }> = ({ attribute, translations }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex items-center">
            <HelpCircle className="ml-1 h-4 w-4 text-gray-400" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{translations.cpuComparison.tooltips[attribute] || "No description available"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface CPUComparisonProps {
  initialCpu1: string;
  initialCpu2: string;
  lang: string;
}

const CPUComparison: React.FC<CPUComparisonProps> = ({ initialCpu1, initialCpu2, lang }) => {
  const [cpuList, setCpuList] = useState<CPU[]>([]);
  const [cpu1, setCpu1] = useState<string>(initialCpu1);
  const [cpu2, setCpu2] = useState<string>(initialCpu2);
  const [comparisonResult, setComparisonResult] = useState<[CPU, CPU] | null>(null);
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [translationsResponse, cpusResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/cpudescription?locale=${lang}`),
          fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/cpus`)
        ]);

        if (!translationsResponse.ok || !cpusResponse.ok) {
          throw new Error("One or more network responses were not ok");
        }

        const translationsData = await translationsResponse.json();
        const cpusData = await cpusResponse.json();

        if (translationsData.data && translationsData.data.attributes) {
          setTranslations(translationsData.data.attributes.cpudescription);
        } else {
          throw new Error("Invalid translations data structure");
        }

        if (cpusData.data) {
          const cpus = cpusData.data.map((item: any) => ({
            id: item.id,
            ...item.attributes.CPU,
          }));
          setCpuList(cpus);

          const selectedCpu1 = cpus.find((cpu: CPU) => cpu.cpu_name === cpu1);
          const selectedCpu2 = cpus.find((cpu: CPU) => cpu.cpu_name === cpu2);

          if (selectedCpu1 && selectedCpu2) {
            setComparisonResult([selectedCpu1, selectedCpu2]);
          } else {
            throw new Error("One or both selected CPUs not found");
          }
        } else {
          throw new Error("Invalid CPU data structure");
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
    if (cpu1 && cpu2) {
      const cpu1Formatted = cpu1.replace(/ /g, '-');
      const cpu2Formatted = cpu2.replace(/ /g, '-');

      router.push(`/${userLanguage}/cpu/compare/${cpu1Formatted}-vs-${cpu2Formatted}`);
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

  const cpuOptions = cpuList.map((cpu) => ({
    value: cpu.cpu_name,
    label: cpu.cpu_name,
  }));

  const comparisonAttributes: (keyof CPU)[] = [
    "num_sockets",
    "cores",
    "price",
    "cpu_mark",
    "cpu_value",
    "thread_mark",
    "thread_value",
    "tdp",
    "power_perf",
    "test_date",
    "socket",
    "category",
  ];

  const numericAttributes: (keyof CPU)[] = [
    "num_sockets",
    "cores",
    "price",
    "cpu_mark",
    "cpu_value",
    "thread_mark",
    "thread_value",
    "tdp",
    "power_perf",
  ];

  const performanceAttributes: (keyof CPU)[] = ["cpu_mark", "thread_mark", "cores", "tdp", "power_perf"];

  const getBarStyle = (attribute: keyof CPU, index: number) => {
    if (!comparisonResult || !numericAttributes.includes(attribute)) return {};

    const parseValue = (val: any): number | null => {
      if (val == null) return null;
      return parseFloat(String(val).replace(',', ''));
    };

    const value1 = parseValue(comparisonResult[0][attribute]);
    const value2 = parseValue(comparisonResult[1][attribute]);

    if (value1 == null || value2 == null) {
      if (index === 0 && value1 != null) {
        return {
          background: `linear-gradient(90deg, hsl(210, 50%, 80%) 100%, hsl(210, 50%, 80%) 100%)`,
        };
      } else if (index === 1 && value2 != null) {
        return {
          background: `linear-gradient(90deg, hsl(210, 50%, 80%) 100%, hsl(210, 50%, 80%) 100%)`,
        };
      }
      return {};
    }

    if (value1 === value2) {
      return {
        background: `linear-gradient(90deg, hsl(210, 50%, 80%) 100%, hsl(210, 50%, 80%) 100%)`,
      };
    }

    const maxValue = Math.max(value1, value2);
    const minValue = Math.min(value1, value2);
    const currentValue = parseFloat(String(comparisonResult[index][attribute]).replace(',', ''));
    const isBestValue = (attribute === "price" || attribute === "tdp") ? currentValue === minValue : currentValue === maxValue;
    const otherValue = parseFloat(String(comparisonResult[1 - index][attribute]).replace(',', ''));

    const differenceRatio = Math.abs(currentValue - otherValue) / Math.max(maxValue, 1);
    const percentage = (currentValue / maxValue) * 100;

    let color = `hsl(120, 70%, 60%)`;

    if (!isBestValue) {
      const hue = 100 - (differenceRatio * 120);
      color = `hsl(${hue}, 70%, 60%)`;
    }

    return {
      background: `linear-gradient(90deg, ${color} ${percentage}%, transparent ${percentage}%)`,
    };
  };

  const getOverallComparisonPercentage = (): {
    betterCpu: string | null,
    worseCpu: string | null,
    percentageDifference: number | null,
    isEqual: boolean
  } => {
    if (!comparisonResult) return { betterCpu: null, worseCpu: null, percentageDifference: null, isEqual: false };

    let totalImprovement = 0;
    let totalAttributesCounted = 0;

    performanceAttributes.forEach((attribute) => {
      const value1 = parseFloat(String(comparisonResult[0][attribute]).replace(',', ''));
      const value2 = parseFloat(String(comparisonResult[1][attribute]).replace(',', ''));

      if (value1 != null && value2 != null && value1 !== 0 && value2 !== 0) {
        if (value1 > value2) {
          const improvementPercentage = ((value1 - value2) / value2) * 100;
          totalImprovement += improvementPercentage;
          totalAttributesCounted++;
        } else if (value2 > value1) {
          const improvementPercentage = ((value2 - value1) / value1) * 100;
          totalImprovement -= improvementPercentage;
          totalAttributesCounted++;
        }
      }
    });

    if (totalAttributesCounted === 0) {
      return { betterCpu: null, worseCpu: null, percentageDifference: null, isEqual: true };
    }

    const averageImprovement = totalImprovement / totalAttributesCounted;

    if (averageImprovement > 0) {
      return {
        betterCpu: comparisonResult[0].cpu_name,
        worseCpu: comparisonResult[1].cpu_name,
        percentageDifference: Number(averageImprovement.toFixed(2)),
        isEqual: false
      };
    } else {
      return {
        betterCpu: comparisonResult[1].cpu_name,
        worseCpu: comparisonResult[0].cpu_name,
        percentageDifference: Number(Math.abs(averageImprovement).toFixed(2)),
        isEqual: false
      };
    }
  };

  const cpuComparisons = [
    { cpu: 'Intel Core i5 12400F vs AMD Ryzen 5 5600' },
    { cpu: 'AMD Ryzen 5 5600X vs Intel Core i5 12400F' },
    { cpu: 'AMD Ryzen 5 5600 vs AMD Ryzen 5 5500' },
    { cpu: 'Intel Core i5 12400F vs AMD Ryzen 5 7500F' },
    { cpu: 'Intel Core i5 12400F vs AMD Ryzen 5 5500' },
    { cpu: 'AMD Ryzen 5 3600 vs AMD Ryzen 5 5500' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">{translations.cpuComparison.title}</h1>
      <p className="text-xl mb-8 text-center text-gray-600">{translations.cpuComparison.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {translations.cpuComparison.selectCPU1}
          </label>
          <Select
            value={cpuOptions.find((option) => option.value === cpu1) || null}
            onChange={(option) => handleSelectChange(option, setCpu1)}
            options={cpuOptions}
            classNamePrefix="react-select"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {translations.cpuComparison.selectCPU2}
          </label>
          <Select
            value={cpuOptions.find((option) => option.value === cpu2) || null}
            onChange={(option) => handleSelectChange(option, setCpu2)}
            options={cpuOptions}
            classNamePrefix="react-select"
            className="w-full"
          />
        </div>
      </div>

      <div className="text-center mb-10">
        <button
          onClick={handleCompare}
          disabled={!cpu1 || !cpu2}
          className={`px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:-translate-y-1 ${(!cpu1 || !cpu2) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
        >
          {translations.cpuComparison.compareButton}
        </button>
      </div>

      <div className="overflow-x-auto bg-gray-50 rounded-xl px-1 md:p-6">
        {comparisonResult && (
          <div className="overflow-x-auto bg-gray-50 rounded-xl px-1 md:p-6">
            <div className="mt-6 pb-6 text-center text-xl font-semibold text-gray-800">
              {(() => {
                const comparisonData = getOverallComparisonPercentage();
                if (comparisonData.isEqual) {
                  return translations.cpuComparison.bothequal;
                } else {
                  return (
                    <>
                      <span className="text-green-600">{comparisonData.betterCpu}</span>
                      {' '}
                      {translations.cpuComparison.is}
                      {' '}
                      <span className="text-blue-600">{comparisonData.percentageDifference}%</span>
                      {' '}
                      {translations.cpuComparison.betterthan}
                      {' '}
                      <span className="text-red-600">{comparisonData.worseCpu}</span>
                      {' '}
                      {translations.cpuComparison.basedon}
                    </>
                  );
                }
              })()}
            </div>
            <div className="overflow-x-auto bg-gray-50 rounded-xl p-6">
              <div className="md:hidden mb-4 flex justify-between font-bold text-sm text-gray-900">
                <div className="w-1/2 px-2">{comparisonResult[0].cpu_name}</div>
                <div className="w-1/2 px-2">{comparisonResult[1].cpu_name}</div>
              </div>

              <table className="w-full">
                <thead className="hidden md:table-header-group">
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                      {translations.cpuComparison.attribute}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                      {comparisonResult[0].cpu_name}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                      {comparisonResult[1].cpu_name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonAttributes.map((attribute) => (
                    <React.Fragment key={attribute}>
                      <tr key={`${attribute}-header`} className="md:hidden border-b border-gray-200 bg-gray-50">
                        <td colSpan={2} className="px-6 py-2 text-sm font-semibold text-gray-700">
                          <>{translations.cpuComparison[attribute] || attribute}</>
                        </td>
                      </tr>
                      <tr key={`${attribute}-data`} className="border-b border-gray-200 hover:bg-gray-100 transition duration-150 ease-in-out">
                        <td className="hidden md:flex md:items-center px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                          <>{translations.cpuComparison[attribute] || attribute}</>
                          <AttributeWithTooltip attribute={attribute} translations={translations} />
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                          style={getBarStyle(attribute, 0)}
                        >
                          {comparisonResult[0][attribute]}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                          style={getBarStyle(attribute, 1)}
                        >
                          {comparisonResult[1][attribute]}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {comparisonResult && (
        <CPUPerformanceRadar
          cpu1={comparisonResult[0]}
          cpu2={comparisonResult[1]}
          translations={translations}
        />
      )}
      {/* {comparisonResult.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {comparisonResult.map((cpu, index) => (
            cpu.amazonLink && (
              <a
                key={index}
                href={cpu.amazonLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`block p-4 mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out
                  }`}
              >
                <div className="flex flex-col md:flex-row items-center justify-between text-black">
                  <div className='flex flex-col'>
                    <span className="font-bold text-xl hover:underline">{cpu.cpu_name}</span>
                    <span className="font-bold text-lg hover:underline">{translations.cpuComparison.buyonamazon}</span>
                    <span className="font-light text-xs my-2">{translations.cpuComparison.amazondisclaimer}</span>
                  </div>
                  <Image src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/uploads/amazon-logo.png`} alt="Amazon logo" width={100} height={50} className='py-4 md:py-0' />
                </div>
              </a>
            )
          ))}
        </div>
      )} */}
      <div className="my-8">
        <Accordion type="single" collapsible defaultValue='detail'>
          <AccordionItem value="detail">
            <AccordionTrigger className="text-lg font-semibold hover:text-blue-600">
              {translations.cpuComparison.details.title}
            </AccordionTrigger>
            <AccordionContent className="space-y-6">
              {comparisonAttributes.map((attribute) => (
                <CPUDetailSection
                  key={attribute}
                  attribute={attribute}
                  translations={translations}
                  cpu1={comparisonResult[0]}
                  cpu2={comparisonResult[1]}
                  numericAttributes={numericAttributes}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <CPUComparisonBubbles comparisons={cpuComparisons} lang={userLanguage} />
    </div>
  );
};

export default CPUComparison;