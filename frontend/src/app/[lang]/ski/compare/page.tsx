"use client";

import React, { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";
import Loader from "../../components/Loader";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageContext";

interface Ski {
  id: number;
  ski_name: string;
}

interface Translation {
  selection_page: {
    title: string;
    description: string;
    ski1: string;
    ski2: string;
    instructions: string[];
    filters: {
      brand: string;
      category: string;
      size: string;
      terrain: string;
      skill_level: string;
    };
    buttons: {
      add_to_comparison: string;
      compare_now: string;
    };
  };
}

const SkiPage: React.FC = () => {
  const [skiList, setSkiList] = useState<Ski[]>([]);
  const [ski1, setSki1] = useState<string | null>(null);
  const [ski2, setSki2] = useState<string | null>(null);
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
        const [translationsResponse, skisResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/skidescription?locale=${lang}`),
          fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/skis`)
        ]);

        if (!translationsResponse.ok || !skisResponse.ok) {
          throw new Error("One or more network responses were not ok");
        }

        const translationsData = await translationsResponse.json();
        console.log("translationData: ",translationsData);
        const skisData = await skisResponse.json();
        console.log(skisData)

        if (translationsData.data && translationsData.data.attributes) {
          setTranslations(translationsData.data.attributes.skidescription.pages);
        } else {
          throw new Error("Invalid translations data structure");
        }

        if (skisData.data) {
          setSkiList(
            skisData.data.map((item: any) => ({
              id: item.id,
              ski_name: item.attributes.ski.name,
            }))
          );
        } else {
          throw new Error("Invalid ski data structure");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Une erreur est survenue lors de la récupération des données. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lang]);

  const handleCompare = () => {
    if (ski1 && ski2) {
      const ski1Formatted = encodeURI(ski1.replace(/ /g, "-"));
      const ski2Formatted = encodeURI(ski2.replace(/ /g, "-"));

      router.push(`/${lang}/ski/compare/${ski1Formatted}-vs-${ski2Formatted}`);
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
    return <div className="text-center">Les traductions ne sont pas disponibles</div>;
  }

  const skiOptions = skiList.map((ski) => ({
    value: ski.ski_name,
    label: ski.ski_name,
  }));

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">{translations.selection_page.title}</h1>
      <p className="text-xl mb-8 text-center text-gray-600">{translations.selection_page.description}</p>

      {/* <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Instructions :</h2>
        <ul className="list-disc list-inside text-gray-600">
          {translations.selection_page.instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {translations.selection_page.ski1}
          </label>
          <Select
            value={skiOptions.find((option) => option.value === ski1) || null}
            onChange={(option) => handleSelectChange(option, setSki1)}
            options={skiOptions}
            isClearable
            classNamePrefix="react-select"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {translations.selection_page.ski2}
          </label>
          <Select
            value={skiOptions.find((option) => option.value === ski2) || null}
            onChange={(option) => handleSelectChange(option, setSki2)}
            options={skiOptions}
            isClearable
            classNamePrefix="react-select"
            className="w-full"
          />
        </div>
      </div>

      <div className="text-center mb-10">
        <button
          onClick={handleCompare}
          disabled={!ski1 || !ski2}
          className={`px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:-translate-y-1 ${
            (!ski1 || !ski2) ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {translations.selection_page.buttons.compare_now}
        </button>
      </div>
    </div>
  );
};

export default SkiPage;
