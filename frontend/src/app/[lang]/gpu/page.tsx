"use client";
import React, { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

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
    [key: string]: string; // Add index signature
  };
}

const GPUPage: React.FC = () => {
  const [gpuList, setGpuList] = useState<GPU[]>([]);
  const [gpu1, setGpu1] = useState<string | null>(null);
  const [gpu2, setGpu2] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<[GPU, GPU] | null>(null);
  const [translations, setTranslations] = useState<Translation | null>(null);

  useEffect(() => {
    const userLanguage = navigator.language.split("-")[0];

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
    return <div>Loading...</div>;
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
    const maxValue = Math.max(value1, value2);
    const currentValue = comparisonResult[index][attribute] as number;
    const percentage = (currentValue / maxValue) * 100;

    let color;
    if (attribute === "price" || attribute === "tdp") {
      color =
        index === 0
          ? `rgb(${Math.round(255 * (1 - percentage / 100))}, 255, 0)`
          : `rgb(255, ${Math.round(255 * (percentage / 100))}, 0)`;
    } else {
      color =
        index === 0
          ? `rgb(255, ${Math.round(255 * (percentage / 100))}, 0)`
          : `rgb(${Math.round(255 * (1 - percentage / 100))}, 255, 0)`;
    }

    return {
      background: `linear-gradient(90deg, ${color} ${percentage}%, transparent ${percentage}%)`,
    };
  };

  const getOverallComparisonPercentage = () => {
    if (!comparisonResult) return null;

    let totalImprovement = 0;
    let totalAttributesCounted = 0;

    performanceAttributes.forEach((attribute) => {
      const value1 = comparisonResult[0][attribute] as number;
      const value2 = comparisonResult[1][attribute] as number;

      if (value1 !== 0 && value2 !== 0) {
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
      return translations?.gpuComparison.bothequal;
    }

    const averageImprovement = totalImprovement / totalAttributesCounted;

    if (averageImprovement > 0) {
      return `${comparisonResult[0].videocard_name} ${translations?.gpuComparison.is} ${averageImprovement.toFixed(
        2
      )}% ${translations?.gpuComparison.betterthan} ${comparisonResult[1].videocard_name} ${translations?.gpuComparison.basedon}`;
    } else {
      return `${comparisonResult[1].videocard_name} ${translations?.gpuComparison.is} ${Math.abs(
        averageImprovement
      ).toFixed(2)}% ${translations?.gpuComparison.betterthan} ${comparisonResult[0].videocard_name} ${translations?.gpuComparison.basedon}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">{translations.gpuComparison.title}</h1>
      <p className="text-lg mb-6 text-center text-gray-600">{translations.gpuComparison.description}</p>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
      <div className="text-center mb-8">
        <button
          onClick={compareGPUs}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {translations.gpuComparison.compareButton}
        </button>
      </div>

      {comparisonResult && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  {translations.gpuComparison.attribute}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  {comparisonResult[0].videocard_name}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  {comparisonResult[1].videocard_name}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {comparisonAttributes.map((attribute) => (
                <tr key={attribute} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500">
                    {translations.gpuComparison[attribute] || attribute}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    style={getBarStyle(attribute, 0)}
                  >
                    {comparisonResult[0][attribute]}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    style={getBarStyle(attribute, 1)}
                  >
                    {comparisonResult[1][attribute]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Overall Comparison Line */}
          <div className="mt-4 text-center text-lg font-semibold text-gray-700">
            {`${getOverallComparisonPercentage()}`}
          </div>
        </div>
      )}
    </div>
  );
};

export default GPUPage;

