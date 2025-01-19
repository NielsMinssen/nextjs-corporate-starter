"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Select, { SingleValue } from "react-select";
import Loader from "../../components/Loader";
import GPUComparisonBubbles from "../../components/gpu/GPUComparisonBubbles";
import { useLanguage } from "../../components/LanguageContext";
interface GPU {
  id: number;
  videocard_name: string;
}

interface Translation {
  gpuComparison: {
    title: string;
    description: string;
    selectGPU1: string;
    selectGPU2: string;
    compareButton: string;
    [key: string]: string;
  };
}

const GPUPage: React.FC = () => {
  const [gpuList, setGpuList] = useState<GPU[]>([]);
  const [gpu1, setGpu1] = useState<string | null>(null);
  const [gpu2, setGpu2] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Translation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const lang = useLanguage();

  // Define the type for supported languages
  type SupportedLanguage = 'fr' | 'es' | 'en';

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
          setGpuList(
            gpusData.data.map((item: any) => ({
              id: item.id,
              videocard_name: item.attributes.GPU.videocard_name,
            }))
          );
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
  }, []); // Add userLanguage to the dependency array

  const handleCompare = () => {
    if (gpu1 && gpu2) {
      const gpu1Formatted = gpu1.replace(/ /g, '-');
      const gpu2Formatted = gpu2.replace(/ /g, '-');

      router.push(`/${lang}/gpu/compare/${gpu1Formatted}-vs-${gpu2Formatted}`);
    }
  };


  const handleSelectChange = (
    selectedOption: SingleValue<{ value: string; label: string }>,
    setter: (value: string | null) => void
  ) => {
    setter(selectedOption ? selectedOption.value : null);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!translations) {
    return <div className="text-center">Translations not available</div>;
  }

  const gpuOptions = gpuList.map((gpu) => ({
    value: gpu.videocard_name,
    label: gpu.videocard_name,
  }));

  const gpuComparisons = [
    { gpu: 'GeForce RTX 3060 12GB vs GeForce RTX 4060' },
    { gpu: 'GeForce RTX 3060 Ti vs GeForce RTX 4060' },
    { gpu: 'GeForce RTX 3070 vs GeForce RTX 4060' },
    { gpu: 'GeForce RTX 4060 vs GeForce RTX 4060 Ti' },
    { gpu: 'GeForce GTX 1060 5GB vs Radeon RX 580' },
    { gpu: 'GeForce RTX 2060 SUPER vs GeForce RTX 3060 12GB' },
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
          onClick={handleCompare}
          disabled={!gpu1 || !gpu2}
          className={`px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:-translate-y-1 ${(!gpu1 || !gpu2) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
        >
          {translations.gpuComparison.compareButton}
        </button>
      </div>
      <GPUComparisonBubbles comparisons={gpuComparisons} lang={lang} />
    </div>
  );
};

export default GPUPage;
