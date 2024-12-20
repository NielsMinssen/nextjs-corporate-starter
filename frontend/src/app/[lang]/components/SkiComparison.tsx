"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Select from "react-select";
import Loader from "@/app/[lang]/components/Loader";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import Image from 'next/image';
import ski from "./../../../../public/ski.png"
import { env } from 'process';
import { Ruler, Weight, CircleDot } from 'lucide-react';

interface SkiDimensions {
  tip_width: number;
  waist_width: number;
  tail_width: number;
}

interface SkiSize {
  length: number;
  dimensions: SkiDimensions;
  radius: number;
  weight: number;
}

interface RockerProfile {
  front: string;
  middle: string;
  tail: string;
}

interface AveragePrice {
  currency: string;
  value: number;
}

interface BindingCompatibility {
  DIN_range: string;
  binding_system: string;
}

interface Ski {
  name: string;
  brand: string;
  category: string;
  type: string;
  available_sizes: number[];
  dimensions: SkiDimensions;
  sizes: SkiSize[];
  materials: string[];
  rocker_profile: RockerProfile;
  terrain: string[];
  skill_level: string[];
  average_price: AveragePrice;
  binding_compatibility: BindingCompatibility;
  gender: string;
  year: number;
  color: string[];
  description: string;
}

interface Translation {
  pages: {
    comparison_page: {
      title: string;
      description: string;
      table_headers: {
        [key: string]: string;
      };
      actions: {
        [key: string]: string;
      };
    };
  };
}

const SkiComparison: React.FC<{ initialSki1: string; initialSki2: string; lang: string }> = ({
  initialSki1,
  initialSki2,
  lang,
}) => {
  const [skiList, setSkiList] = useState<Ski[]>([]);
  const [ski1, setSki1] = useState<Ski | null>(null);
  const [ski2, setSki2] = useState<Ski | null>(null);
  const [selectedSize1, setSelectedSize1] = useState<number | null>(null);
  const [selectedSize2, setSelectedSize2] = useState<number | null>(null);
  const [comparisonResult, setComparisonResult] = useState<[Ski, Ski] | null>(null);
  const [translations, setTranslations] = useState<Translation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [translationsResponse, skisResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/skidescription?locale=${lang}`),
          fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/skis`),
        ]);

        if (!translationsResponse.ok || !skisResponse.ok) {
          throw new Error("One or more network responses were not ok");
        }

        const translationsData = await translationsResponse.json();
        const skisData = await skisResponse.json();

        if (translationsData.data && translationsData.data.attributes) {
          setTranslations(translationsData.data.attributes.skidescription);
        } else {
          throw new Error("Invalid translations data structure");
        }

        if (skisData.data) {
          const skis = skisData.data.map((item: any) => ({
            id: item.id,
            ...item.attributes.ski,
          }));
          setSkiList(skis);

          const selectedSki1 = skis.find((ski: Ski) => ski.name === initialSki1);
          const selectedSki2 = skis.find((ski: Ski) => ski.name === initialSki2);

          if (selectedSki1 && selectedSki2) {
            setSki1(selectedSki1);
            setSki2(selectedSki2);
            setComparisonResult([selectedSki1, selectedSki2]);

            // Set selected sizes
            setSelectedSize1(selectedSki1.sizes[0].length);
            setSelectedSize2(selectedSki2.sizes[0].length);
          } else {
            throw new Error("One or both selected skis not found");
          }
        } else {
          throw new Error("Invalid ski data structure");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lang, initialSki1, initialSki2]);

  const handleCompare = () => {
    if (ski1 && ski2) {
      router.push(`/${lang}/skis/compare/${ski1}-vs-${ski2}`);
    }
  };

  const renderSizeSelectors = (ski: Ski, selectedSize: number | null, setSelectedSize: (size: number) => void, color: string) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {ski.sizes.map((size) => (
        <label 
          key={size.length} 
          className="flex items-center space-x-2 cursor-pointer"
        >
          <input
            type="radio"
            name={`size-${ski.name}`}
            value={size.length}
            checked={selectedSize === size.length}
            onChange={() => setSelectedSize(size.length)}
            className={`w-4 h-4 ${color === 'blue' ? 'text-blue-500' : 'text-green-500'}`}
          />
          <span className={`text-sm font-medium ${color === 'blue' ? 'text-blue-500' : 'text-green-500'}`}>
            {size.length} cm
          </span>
        </label>
      ))}
    </div>
  );

  const renderSkiStats = (ski: Ski | null, selectedSize: number | null, selectedSizeData: SkiSize, color: string) => (
    <div className="flex flex-col items-center space-y-4 w-full">
      <span className={`font-bold text-lg text-center ${color === 'blue' ? 'text-blue-500' : 'text-green-500'}`}>
        {formatSkiName(ski?.name!)}
      </span>
      {/* Stats items */}
      <div>
      {[
        { icon: Ruler, label: 'Length', value: `${selectedSizeData.length} mm` },
        { icon: Ruler, label: 'Tip', value: `${selectedSizeData.dimensions.tip_width} mm` },
        { icon: Ruler, label: 'Waist', value: `${selectedSizeData.dimensions.waist_width} mm` },
        { icon: Ruler, label: 'Tail', value: `${selectedSizeData.dimensions.tail_width} mm` },
        { icon: Weight, label: 'Weight', value: `${selectedSizeData.weight} g` },
        { icon: CircleDot, label: 'Radius', value: `${selectedSizeData.radius} m` },
      ].map(({ icon: Icon, label, value }, index) => (
        <div key={index} className="flex items-center space-x-3">
          <Icon className={`h-5 w-5 ${color === 'blue' ? 'text-blue-500' : 'text-green-500'}`} />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-600">{label}</span>
            <span className={`text-lg font-semibold ${color === 'blue' ? 'text-blue-500' : 'text-green-500'}`}>
              {value}
            </span>
          </div>
        </div>
      ))}
      </div>
    </div>
  );

  if (isLoading) return <Loader />;
  if (!translations || !comparisonResult) return null;

  const [skiData1, skiData2] = comparisonResult;

  const selectedSki1 = skiData1.sizes.find((size) => size.length === selectedSize1)!;
  const selectedSki2 = skiData2.sizes.find((size) => size.length === selectedSize2)!;


  return (
<div className="max-w-4xl mx-auto p-4 md:p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
        {translations.pages.comparison_page.title}
      </h1>

      {/* Ski Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        <div className="space-y-2">
          <Select
            value={{ value: ski1, label: ski1!.name }}
            onChange={(option) => option && setSki1(option.value)}
            options={skiList.map(ski => ({ value: ski, label: ski.name }))}
          />
          {renderSizeSelectors(skiData1, selectedSize1, setSelectedSize1, 'blue')}
        </div>
        <div className="space-y-2">
          <Select
            value={{ value: ski2, label: ski2!.name }}
            onChange={(option) => option && setSki2(option.value)}
            options={skiList.map(ski => ({ value: ski, label: ski.name }))}
          />
          {renderSizeSelectors(skiData2, selectedSize2, setSelectedSize2, 'green')}
        </div>
      </div>

      {comparisonResult && (
        <div className="space-y-8">
          <div className="relative bg-gray-50 p-4 md:p-6 rounded-xl">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-8 md:space-y-0 md:space-x-4">
              {/* Stats Left - Hidden on mobile */}
              <div className="hidden md:flex md:flex-col md:space-y-4 md:w-1/3">
                {renderSkiStats(ski1, selectedSize1, selectedSki1, 'blue')}
              </div>

              {/* Central Ski Diagram */}
              <div className="relative h-64 md:w-1/3 flex flex-col items-center order-first md:order-none">
                <div className="relative">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/uploads/ski.svg`}
                    alt="Ski diagram"
                    width={50}
                    height={100}
                    className="mx-auto"
                  />

                  {/* Measurements */}
                  <div className="absolute left-[-60px] text-sm font-medium text-blue-500" style={{ top: "3%" }}>
                    {selectedSki1.dimensions.tip_width} mm
                  </div>
                  <div className="absolute right-[-60px] text-sm font-medium text-green-500" style={{ top: "3%" }}>
                    {selectedSki2.dimensions.tip_width} mm
                  </div>

                  <div className="absolute left-[-60px] text-sm font-medium text-blue-500" style={{ top: "45%" }}>
                    {selectedSki1.dimensions.waist_width} mm
                  </div>
                  <div className="absolute right-[-60px] text-sm font-medium text-green-500" style={{ top: "45%" }}>
                    {selectedSki2.dimensions.waist_width} mm
                  </div>

                  <div className="absolute left-[-60px] text-sm font-medium text-blue-500" style={{ bottom: "5%" }}>
                    {selectedSki1.dimensions.tail_width} mm
                  </div>
                  <div className="absolute right-[-60px] text-sm font-medium text-green-500" style={{ bottom: "5%" }}>
                    {selectedSki2.dimensions.tail_width} mm
                  </div>

                  {/* Labels */}
                  <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                    Tip
                  </div>
                  <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                    Tail
                  </div>
                </div>
              </div>

              {/* Stats Right - Hidden on mobile */}
              <div className="hidden md:flex md:flex-col md:space-y-4 md:w-1/3">
                {renderSkiStats(ski2, selectedSize2, selectedSki2, 'green')}
              </div>
            </div>

            {/* Mobile Stats - Visible only on mobile */}
            <div className="grid grid-cols-2 gap-4 mt-8 md:hidden">
              {renderSkiStats(ski1, selectedSize1, selectedSki1, 'blue')}
              {renderSkiStats(ski2, selectedSize2, selectedSki2, 'green')}
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="overflow-x-auto bg-gray-50 rounded-xl p-6 mt-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Informations suplémentaires</th>
                  <th className="px-6 py-3 text-left font-semibold text-blue-500">
                    {formatSkiName(ski1?.name!)} ({selectedSize1} cm)
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-green-500">
                    {formatSkiName(ski2?.name!)} ({selectedSize2} cm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'materials', label: translations.pages.comparison_page.table_headers.materials },
                  { key: 'terrain', label: translations.pages.comparison_page.table_headers.terrain },
                  { key: 'skill_level', label: translations.pages.comparison_page.table_headers.skill_level },
                  { key: 'rocker_profile', label: translations.pages.comparison_page.table_headers.rocker_profile },
                  { key: 'binding_compatibility', label: translations.pages.comparison_page.table_headers.binding_compatibility },
                  { key: 'average_price', label: translations.pages.comparison_page.table_headers.average_price },
                ].map(({ key, label }) => (
                  <tr key={key} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-600">{label}</td>
                    <td className="px-6 py-4 text-blue-500">
                      {formatSkiValue(ski1!, key, selectedSize1!)}
                    </td>
                    <td className="px-6 py-4 text-green-500">
                      {formatSkiValue(ski2!, key, selectedSize2!)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div >
  );
};

// Function to format the ski name by replacing underscores with spaces
const formatSkiName = (name: string): string => {
  return name.replace(/_/g, ' ');
};

// Function to format the rocker profile object
const formatRockerProfile = (profile: RockerProfile): string => {
  return `${profile.front} / ${profile.middle} / ${profile.tail}`;
};

// Function to format binding compatibility
const formatBindingCompatibility = (binding: BindingCompatibility): string => {
  return `DIN ${binding.DIN_range} - ${binding.binding_system}`;
};

// Updated formatSkiValue function with better handling of complex objects
const formatSkiValue = (ski: Ski, key: string, selectedSize: number): string => {
  // Trouve la taille sélectionnée dans les données du ski
  const selectedSizeData = ski.sizes.find(size => size.length === selectedSize);

  switch (key) {
    case 'dimensions':
      if (selectedSizeData) {
        return `${selectedSizeData.dimensions.tip_width}/${selectedSizeData.dimensions.waist_width}/${selectedSizeData.dimensions.tail_width}`;
      }
      return '';
    case 'radius':
      return selectedSizeData ? `${selectedSizeData.radius} m` : '';
    case 'weight':
      return selectedSizeData ? `${selectedSizeData.weight} g` : '';
    case 'materials':
      return ski.materials.join(', ');
    case 'terrain':
      return ski.terrain.join(', ');
    case 'skill_level':
      return ski.skill_level.join(', ');
    case 'average_price':
      return `${ski.average_price.value} ${ski.average_price.currency}`;
    case 'rocker_profile':
      return formatRockerProfile(ski.rocker_profile);
    case 'binding_compatibility':
      return formatBindingCompatibility(ski.binding_compatibility);
    default:
      return String(ski[key as keyof Ski] || '');
  }
};


export default SkiComparison;