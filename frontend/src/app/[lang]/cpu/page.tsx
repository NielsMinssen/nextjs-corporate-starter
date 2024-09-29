"use client"
import React, { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/[lang]/components/tooltip";
import { HelpCircle } from "lucide-react";
import Loader from "../components/Loader";

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

const CPUPage: React.FC = () => {
  const [cpuList, setCpuList] = useState<CPU[]>([]);
  const [cpu1, setCpu1] = useState<string | null>(null);
  const [cpu2, setCpu2] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<[CPU, CPU] | null>(null);
  const [translations, setTranslations] = useState<Translation | null>(null);

  useEffect(() => {
    const userLanguage = window.location.pathname.split("/")[1];

    const fetchTranslations = async (lang: string) => {
      try {
        const response = await fetch(`http://localhost:1337/api/cpudescription?locale=${lang}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        if (result.data && result.data.attributes) {
          setTranslations(result.data.attributes.cpudescription);
        }
      } catch (error) {
        console.error("Error fetching translations:", error);
      }
    };

    const fetchCPUs = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/cpus");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        if (result.data) {
          setCpuList(
            result.data.map((item: any) => ({
              id: item.id,
              ...item.attributes.CPU,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching CPU data:", error);
      }
    };

    fetchTranslations(userLanguage);
    fetchCPUs();
  }, []);

  const compareCPUs = () => {
    const selectedCpu1 = cpuList.find((cpu) => cpu.cpu_name === cpu1);
    const selectedCpu2 = cpuList.find((cpu) => cpu.cpu_name === cpu2);

    if (selectedCpu1 && selectedCpu2) {
      setComparisonResult([selectedCpu1, selectedCpu2]);
    }
  };

  const cpuOptions = cpuList.map((cpu) => ({
    value: cpu.cpu_name,
    label: cpu.cpu_name,
  }));

  const handleSelectChange = (
    selectedOption: SingleValue<{ value: string; label: string }>,
    setter: (value: string | null) => void
  ) => {
    setter(selectedOption ? selectedOption.value : null);
  };

  if (!translations) {
    return (<Loader />)
  }

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

  // ... (previous code remains the same)

  const getBarStyle = (attribute: keyof CPU, index: number) => {
    if (!comparisonResult || !numericAttributes.includes(attribute)) return {};

    const value1 = comparisonResult[0][attribute] as number | null | undefined;
    const value2 = comparisonResult[1][attribute] as number | null | undefined;

    // Handle cases where one or both values are null or undefined
    if (value1 == null || value2 == null) {
      const currentValue = index === 0 ? value1 : value2;
      if (currentValue == null) {
        return {}; // Return empty object for null or undefined values
      }
      // If only one value exists, show it as a full bar with a neutral color
      return {
        background: `linear-gradient(90deg, hsl(210, 70%, 60%) 100%, hsl(210, 70%, 60%) 100%)`,
      };
    }

    if (value1 === value2) {
      return {
        background: `linear-gradient(90deg, hsl(210, 70%, 60%) 100%, hsl(210, 70%, 60%) 100%)`,
      };
    }

    const isHigherBetter = !(attribute === "price" || attribute === "tdp");
    const betterValue = isHigherBetter ? Math.max(value1, value2) : Math.min(value1, value2);
    const worseValue = isHigherBetter ? Math.min(value1, value2) : Math.max(value1, value2);
    const currentValue = comparisonResult[index][attribute] as number;

    const isBetterValue = currentValue === betterValue;

    // Calculate percentage based on absolute value
    const maxValue = Math.max(value1, value2);
    const percentage = (currentValue / maxValue) * 100;

    // Determine color
    let color;
    if (isBetterValue) {
      color = 'hsl(120, 70%, 60%)'; // Green for the better value
    } else {
      const hueDifference = (Math.abs(betterValue - currentValue) / (isHigherBetter ? betterValue : worseValue)) * 120;
      color = `hsl(${120 - hueDifference}, 70%, 60%)`; // Ranging from green to red based on the difference
    }

    return {
      background: `linear-gradient(90deg, ${color} ${percentage}%, transparent ${percentage}%)`,
    };
  };

  // ... (rest of the code remains the same)

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
      const value1 = comparisonResult[0][attribute] as number;
      const value2 = comparisonResult[1][attribute] as number;

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
            isClearable
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
            isClearable
            classNamePrefix="react-select"
            className="w-full"
          />
        </div>
      </div>

      <div className="text-center mb-10">
        <button
          onClick={compareCPUs}
          className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          {translations.cpuComparison.compareButton}
        </button>
      </div>

      {comparisonResult && (
        <div className="overflow-x-auto bg-gray-50 rounded-xl p-6">
          <div className="overflow-x-auto bg-gray-50 rounded-xl p-6">
            {/* En-tête mobile pour les noms des CPUs */}
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
                    <tr className="md:hidden border-b border-gray-200 bg-gray-50">
                      <td colSpan={2} className="px-6 py-2 text-sm font-medium text-gray-700">
                        <>{translations.cpuComparison[attribute] || attribute}</>
                        <AttributeWithTooltip attribute={attribute} translations={translations} />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-gray-100 transition duration-150 ease-in-out">
                      <td className="hidden md:flex md:items-center px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
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
          <div className="mt-6 text-center text-xl font-semibold text-gray-800">
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
        </div>
      )}
    </div>
  );
};

export default CPUPage;