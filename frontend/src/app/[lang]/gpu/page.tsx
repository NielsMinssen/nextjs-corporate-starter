"use client";
import React, { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/[lang]/components/tooltip";
import { HelpCircle } from "lucide-react";
import Loader from "../components/Loader";

interface GPU {
  id: number;
  videocard_name: string;
  price: number;
  g3d_mark: number;
  videocard_value: number;
  g2d_mark: number;
  tdp: number;
  power_perf: number;
  vram: number;
  test_date: string;
  category: string;
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
          <p>{translations.gpuComparison.tooltips[attribute] || "No description available"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const GPUPage: React.FC = () => {
  const [gpuList, setGpuList] = useState<GPU[]>([]);
  const [gpu1, setGpu1] = useState<string | null>(null);
  const [gpu2, setGpu2] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<[GPU, GPU] | null>(null);
  const [translations, setTranslations] = useState<Translation | null>(null);

  useEffect(() => {
    const userLanguage = window.location.pathname.split("/")[1];

    const fetchTranslations = async (lang: string) => {
      try {
        const response = await fetch(`http://localhost:1337/api/gpudescription?locale=${lang}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        if (result.data && result.data.attributes) {
          setTranslations(result.data.attributes.gpudescription);
        }
      } catch (error) {
        console.error("Error fetching translations:", error);
      }
    };

    const fetchGPUs = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/gpus");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        if (result.data) {
          setGpuList(
            result.data.map((item: any) => ({
              id: item.id,
              ...item.attributes.GPU,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching GPU data:", error);
      }
    };

    fetchTranslations(userLanguage);
    fetchGPUs();
  }, []);

  const compareGPUs = () => {
    const selectedGpu1 = gpuList.find((gpu) => gpu.videocard_name === gpu1);
    const selectedGpu2 = gpuList.find((gpu) => gpu.videocard_name === gpu2);

    if (selectedGpu1 && selectedGpu2) {
      setComparisonResult([selectedGpu1, selectedGpu2]);
    }
  };

  // react-select options
  const gpuOptions = gpuList.map((gpu) => ({
    value: gpu.videocard_name,
    label: gpu.videocard_name,
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

  const comparisonAttributes: (keyof GPU)[] = [
    "price",
    "g3d_mark",
    "videocard_value",
    "g2d_mark",
    "tdp",
    "power_perf",
    "vram",
    "test_date",
    "category",
  ];

  const numericAttributes: (keyof GPU)[] = [
    "price",
    "g3d_mark",
    "videocard_value",
    "g2d_mark",
    "tdp",
    "power_perf",
    "vram",
  ];

  const performanceAttributes: (keyof GPU)[] = ["g3d_mark", "g2d_mark", "tdp", "power_perf", "vram"];

  const getBarStyle = (attribute: keyof GPU, index: number) => {
    if (!comparisonResult || !numericAttributes.includes(attribute)) return {};

    const value1 = comparisonResult[0][attribute] as number;
    const value2 = comparisonResult[1][attribute] as number;

    // If one of the values doesn't exist, use pastel blue for the other existing value
    if (value1 == null || value2 == null) {
      if (index === 0 && value1 != null) {
        return {
          background: `linear-gradient(90deg, hsl(210, 50%, 80%) 100%, hsl(210, 50%, 80%) 100%)`, // pastel blue for the existing value
        };
      } else if (index === 1 && value2 != null) {
        return {
          background: `linear-gradient(90deg, hsl(210, 50%, 80%) 100%, hsl(210, 50%, 80%) 100%)`, // pastel blue for the existing value
        };
      }
      return {}; // No styling if the value doesn't exist
    }

    // If values are the same, return full pastel blue for both
    if (value1 === value2) {
      return {
        background: `linear-gradient(90deg, hsl(210, 50%, 80%) 100%, hsl(210, 50%, 80%) 100%)`, // pastel blue for equal values
      };
    }

    const maxValue = Math.max(value1, value2);
    const minValue = Math.min(value1, value2);
    const currentValue = comparisonResult[index][attribute] as number;
    const isBestValue = (attribute === "price" || attribute === "tdp") ? currentValue === minValue : currentValue === maxValue;
    const otherValue = comparisonResult[1 - index][attribute] as number;

    // Determine the difference ratio
    const differenceRatio = Math.abs(currentValue - otherValue) / Math.max(maxValue, 1); // Avoid division by zero
    const percentage = (currentValue / maxValue) * 100;

    // Base color for the best value (always green)
    let color = `hsl(120, 70%, 60%)`; // green

    if (!isBestValue) {
      // Color transitions from green (120 hue) to red (0 hue) based on how far the values are
      const hue = 100 - (differenceRatio * 120); // Shift hue from 120 (green) to 0 (red) based on the difference
      color = `hsl(${hue}, 70%, 60%)`; // Softened, pastel color
    }

    return {
      background: `linear-gradient(90deg, ${color} ${percentage}%, transparent ${percentage}%)`,
    };
  };

  const getOverallComparisonPercentage = (): {
    betterGpu: string | null,
    worseGpu: string | null,
    percentageDifference: number | null,
    isEqual: boolean
  } => {
    if (!comparisonResult) return { betterGpu: null, worseGpu: null, percentageDifference: null, isEqual: false };

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
      return { betterGpu: null, worseGpu: null, percentageDifference: null, isEqual: true };
    }

    const averageImprovement = totalImprovement / totalAttributesCounted;

    if (averageImprovement > 0) {
      return {
        betterGpu: comparisonResult[0].videocard_name,
        worseGpu: comparisonResult[1].videocard_name,
        percentageDifference: Number(averageImprovement.toFixed(2)),
        isEqual: false
      };
    } else {
      return {
        betterGpu: comparisonResult[1].videocard_name,
        worseGpu: comparisonResult[0].videocard_name,
        percentageDifference: Number(Math.abs(averageImprovement).toFixed(2)),
        isEqual: false
      };
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">{translations.gpuComparison.title}</h1>
      <p className="text-xl mb-8 text-center text-gray-600">{translations.gpuComparison.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {translations.gpuComparison.selectGPU1}
          </label>
          <Select
            value={gpuOptions.find((option) => option.value === gpu1) || null}
            onChange={(option) => handleSelectChange(option, setGpu1)}
            options={gpuOptions}
            isClearable
            classNamePrefix="react-select"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {translations.gpuComparison.selectGPU2}
          </label>
          <Select
            value={gpuOptions.find((option) => option.value === gpu2) || null}
            onChange={(option) => handleSelectChange(option, setGpu2)}
            options={gpuOptions}
            isClearable
            classNamePrefix="react-select"
            className="w-full"
          />
        </div>
      </div>

      <div className="text-center mb-10">
        <button
          onClick={compareGPUs}
          className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          {translations.gpuComparison.compareButton}
        </button>
      </div>

      {comparisonResult && (
        <div className="overflow-x-auto bg-gray-50 rounded-xl p-6">
          <div className="overflow-x-auto bg-gray-50 rounded-xl p-6">
            {/* Mobile-friendly GPU names header */}
            <div className="md:hidden mb-4 flex justify-between font-bold text-sm text-gray-900">
              <div className="w-1/2 px-2">{comparisonResult[0].videocard_name}</div>
              <div className="w-1/2 px-2">{comparisonResult[1].videocard_name}</div>
            </div>

            <table className="w-full">
              <thead className="hidden md:table-header-group">
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    {translations.gpuComparison.attribute}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    {comparisonResult[0].videocard_name}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    {comparisonResult[1].videocard_name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonAttributes.map((attribute) => (
                  <React.Fragment key={attribute}>
                    <tr className="md:hidden border-b border-gray-200 bg-gray-50">
                      <td colSpan={2} className="px-6 py-2 text-sm font-medium text-gray-700">
                        <>{translations.gpuComparison[attribute] || attribute}</>
                        <AttributeWithTooltip attribute={attribute} translations={translations} />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-gray-100 transition duration-150 ease-in-out">
                      <td className="hidden md:flex md:items-center px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                        <>{translations.gpuComparison[attribute] || attribute}</>
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
                return translations.gpuComparison.bothequal;
              } else {
                return (
                  <>
                    <span className="text-green-600">{comparisonData.betterGpu}</span>
                    {' '}
                    {translations.gpuComparison.is}
                    {' '}
                    <span className="text-blue-600">{comparisonData.percentageDifference}%</span>
                    {' '}
                    {translations.gpuComparison.betterthan}
                    {' '}
                    <span className="text-red-600">{comparisonData.worseGpu}</span>
                    {' '}
                    {translations.gpuComparison.basedon}
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

export default GPUPage;

