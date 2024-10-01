"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Select, { SingleValue } from "react-select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/[lang]/components/tooltip";
import { HelpCircle } from "lucide-react";
import Loader from "@/app/[lang]/components/Loader";

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
    compareButton: string;
    attribute: string;
    [key: string]: string | { [key: string]: string };
    tooltips: {
      [key: string]: string;
    };
  };
}

interface GPUComparisonProps {
  initialGpu1: string;
  initialGpu2: string;
  lang: string;
}

const GPUComparison: React.FC<GPUComparisonProps> = ({ initialGpu1, initialGpu2, lang }) => {
  const [gpuList, setGpuList] = useState<GPU[]>([]);
  const [gpu1, setGpu1] = useState<string>(initialGpu1);
  const [gpu2, setGpu2] = useState<string>(initialGpu2);
  const [comparisonResult, setComparisonResult] = useState<[GPU, GPU] | null>(null);
  const [translations, setTranslations] = useState<Translation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [translationsResponse, gpusResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/gpudescription?locale=${lang}`),
          fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/gpus`)
        ]);

        if (!translationsResponse.ok || !gpusResponse.ok) {
          throw new Error("One or more network responses were not ok");
        }

        const translationsData = await translationsResponse.json();
        const gpusData = await gpusResponse.json();

        if (translationsData.data && translationsData.data.attributes) {
          setTranslations(translationsData.data.attributes.gpudescription);
        } else {
          throw new Error("Invalid translations data structure");
        }

        if (gpusData.data) {
          const gpus = gpusData.data.map((item: any) => ({
            id: item.id,
            ...item.attributes.GPU,
          }));
          setGpuList(gpus);
          console.log("le gpu1 : ",gpu1);
          console.log("le gpu2 : ",gpu2);
          
          const selectedGpu1 = gpus.find((gpu: GPU) => gpu.videocard_name === gpu1);
          const selectedGpu2 = gpus.find((gpu: GPU) => gpu.videocard_name === gpu2);
          
          if (selectedGpu1 && selectedGpu2) {
            setComparisonResult([selectedGpu1, selectedGpu2]);
          } else {
            throw new Error("One or both selected GPUs not found");
          }
        } else {
          throw new Error("Invalid GPU data structure");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lang, gpu1, gpu2]);

  const handleSelectChange = (
    selectedOption: SingleValue<{ value: string; label: string }>,
    setter: (value: string) => void
  ) => {
    if (selectedOption) {
      setter(selectedOption.value);
      router.push(`/${lang}/gpu/compare/${encodeURIComponent(gpu1)}/${encodeURIComponent(gpu2)}`);
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

  const gpuOptions = gpuList.map((gpu) => ({
    value: gpu.videocard_name,
    label: gpu.videocard_name,
  }));

  const AttributeWithTooltip: React.FC<{ attribute: string }> = ({ attribute }) => {
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
            classNamePrefix="react-select"
            className="w-full"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-gray-50 rounded-xl p-6">
        <table className="w-full">
          <thead>
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
              <tr key={attribute} className="border-b border-gray-200 hover:bg-gray-100 transition duration-150 ease-in-out">
                <td className="flex items-center px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                  <>{translations.gpuComparison[attribute] || attribute}</>
                  <AttributeWithTooltip attribute={attribute} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {comparisonResult[0][attribute]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {comparisonResult[1][attribute]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GPUComparison;