"use client"
import React, { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/[lang]/components/tooltip";
import { HelpCircle } from "lucide-react";
import Loader from "../../components/Loader";
import { useRouter } from "next/navigation";
import CPUComparisonBubbles from "../../components/CPUComparisonBubbles";
import { useLanguage } from "../../components/LanguageContext";

interface CPU {
  id: number;
  cpu_name: string;
}

interface Translation {
  cpuComparison: {
    title: string;
    description: string;
    selectCPU1: string;
    selectCPU2: string;
    select: string;
    compareButton: string;
   
    [key: string]: string;
  };
}

const CPUPage: React.FC = () => {
  const [cpuList, setCpuList] = useState<CPU[]>([]);
  const [cpu1, setCpu1] = useState<string | null>(null);
  const [cpu2, setCpu2] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Translation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const lang = useLanguage();

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
            setCpuList(
              cpusData.data.map((item: any) => ({
                id: item.id,
                cpu_name: item.attributes.CPU.cpu_name ,
              }))
            );
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
    }, []); // Add userLanguage to the dependency array

    const handleCompare = () => {
      if (cpu1 && cpu2) {
        const cpu1Formatted = encodeURI(cpu1.replace(/ /g, '-'));
        const cpu2Formatted = encodeURI(cpu2.replace(/ /g, '-'));
        
        router.push(`/${lang}/cpu/compare/${cpu1Formatted}-vs-${cpu2Formatted}`);
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

  const cpuOptions = cpuList.map((cpu) => ({
    value: cpu.cpu_name,
    label: cpu.cpu_name,
  }));

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
            {translations.cpuComparison.selectGPU1}
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
            {translations.cpuComparison.selectGPU2}
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
          onClick={handleCompare}
          disabled={!cpu1 || !cpu2}
          className={`px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:-translate-y-1 ${
            (!cpu1 || !cpu2) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {translations.cpuComparison.compareButton}
        </button>
      </div>
      <CPUComparisonBubbles comparisons={cpuComparisons} lang={lang} />
    </div>
  );
};

export default CPUPage;
