"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Select from "react-select";
import Loader from "@/app/[lang]/components/Loader";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import Image from 'next/image';
import ski from "./../../../../public/ski.png"
import { env } from 'process';

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

  if (isLoading) return <Loader />;
  if (!translations || !comparisonResult) return null;

  const [skiData1, skiData2] = comparisonResult;

  const selectedSki1 = skiData1.sizes.find((size) => size.length === selectedSize1)!;
  const selectedSki2 = skiData2.sizes.find((size) => size.length === selectedSize2)!;


  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-4xl font-bold mb-6 text-center">
        {translations.pages.comparison_page.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Select
          value={{ value: ski1, label: ski1!.name }}
          onChange={(option) => option && setSki1(option.value)}
          options={skiList.map(ski => ({ value: ski, label: ski.name }))}
          className="w-full"
        />
        <Select
          value={{ value: ski2, label: ski2!.name }}
          onChange={(option) => option && setSki2(option.value)}
          options={skiList.map(ski => ({ value: ski, label: ski.name }))}
          className="w-full"
        />
      </div>

      {comparisonResult && (
        <>
          {/* Dimensions Comparison Chart */}
          {/* Ski Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <Select
                value={{ value: selectedSize1, label: `${selectedSize1} cm` }}
                onChange={(option) => option && setSelectedSize1(option.value)}
                options={skiData1.sizes.map((size) => ({ value: size.length, label: `${size.length} cm` }))}
              />
            </div>
            <div>
              <Select
                value={{ value: selectedSize2, label: `${selectedSize2} cm` }}
                onChange={(option) => option && setSelectedSize2(option.value)}
                options={skiData2.sizes.map((size) => ({ value: size.length, label: `${size.length} cm` }))}
              />
            </div>
          </div>

          {/* Ski Comparison Visualization */}
          <div className="relative flex justify-between items-center bg-gray-50 p-6 rounded-xl">
            {/* Left Ski */}
            <div className="flex flex-col items-center text-blue-500">
              <p>Tip: {selectedSki1.dimensions.tip_width} mm</p>
              <p>Waist: {selectedSki1.dimensions.waist_width} mm</p>
              <p>Tail: {selectedSki1.dimensions.tail_width} mm</p>
              <p>Weight: {selectedSki1.weight} g</p>
              <p>Radius: {selectedSki1.radius} m</p>
            </div>

            {/* Central Ski */}
            <div className="relative h-64 flex flex-col items-center">
              {/* Ski Body */}
              <div className="">
              <Image src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/uploads/ski.svg`} alt="haha" width={50} height={100}/>
                {/* Tip Width */}
                <div
                  className="absolute left-[-60px] text-sm text-blue-500"
                  style={{ top: "5%" }}
                >
                  {selectedSki1?.dimensions.tip_width} mm
                </div>
                <div
                  className="absolute right-[-60px] text-sm text-green-500"
                  style={{ top: "5%" }}
                >
                  {selectedSki2?.dimensions.tip_width} mm
                </div>

                {/* Waist Width */}
                <div
                  className="absolute left-[-60px] text-sm text-blue-500"
                  style={{ top: "50%" }}
                >
                  {selectedSki1?.dimensions.waist_width} mm
                </div>
                <div
                  className="absolute right-[-60px] text-sm text-green-500"
                  style={{ top: "50%" }}
                >
                  {selectedSki2?.dimensions.waist_width} mm
                </div>

                {/* Tail Width */}
                <div
                  className="absolute left-[-60px] text-sm text-blue-500"
                  style={{ bottom: "5%" }}
                >
                  {selectedSki1?.dimensions.tail_width} mm
                </div>
                <div
                  className="absolute right-[-60px] text-sm text-green-500"
                  style={{ bottom: "5%" }}
                >
                  {selectedSki2?.dimensions.tail_width} mm
                </div>
              </div>
              {/* Labels */}
              <div className="absolute top-[3%] text-xs text-gray-700">
                Tip
              </div>
              <div className="absolute top-[67%] text-xs text-gray-700">
                Waist
              </div>
              <div className="absolute bottom-[-1%] text-xs text-gray-700">
                Tail
              </div>
            </div>


            {/* Right Ski */}
            <div className="flex flex-col items-center text-green-500">
              <p>Tip: {selectedSki2.dimensions.tip_width} mm</p>
              <p>Waist: {selectedSki2.dimensions.waist_width} mm</p>
              <p>Tail: {selectedSki2.dimensions.tail_width} mm</p>
              <p>Weight: {selectedSki2.weight} g</p>
              <p>Radius: {selectedSki2.radius} m</p>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="overflow-x-auto bg-gray-50 rounded-xl p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-3 text-left"></th>
                  <th className="px-6 py-3 text-left">{formatSkiName(comparisonResult[0].name)}</th>
                  <th className="px-6 py-3 text-left">{formatSkiName(comparisonResult[1].name)}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(translations.pages.comparison_page.table_headers)
                  .filter(([key]) => key !== 'model' && key !== 'name') // Skip model/name entries
                  .map(([key, label]) => (
                    <tr key={key} className="border-b border-gray-200">
                      <td className="px-6 py-4 font-semibold">{label}</td>
                      <td className="px-6 py-4">
                        {formatSkiValue(comparisonResult[0], key)}
                      </td>
                      <td className="px-6 py-4">
                        {formatSkiValue(comparisonResult[1], key)}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
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
const formatSkiValue = (ski: Ski, key: string, selectedSize?: number): string => {
  // Helper to get dimension values based on selected size
  const getDimensionValue = (dimension: keyof SkiDimensions) => {
    if (selectedSize) {
      const sizeIndex = ski.available_sizes.indexOf(selectedSize);
      if (sizeIndex !== -1) {
        // Assuming dimensions are arrays for each size
        return ski.sizes[sizeIndex].dimensions[dimension];
      }
    }
  };

  switch (key) {
    case 'name':
      return formatSkiName(ski.name);
    case 'dimensions':
      // Dynamically update dimensions based on selected size
      if (selectedSize) {
        const tip = getDimensionValue('tip_width');
        const waist = getDimensionValue('waist_width');
        const tail = getDimensionValue('tail_width');
        return `${tip}/${waist}/${tail}`;
      }
      // Dynamically update radius based on selected size if applicable
      if (selectedSize) {
        const radiusIndex = ski.available_sizes.indexOf(selectedSize);
        const Radius = ski.sizes[radiusIndex].radius;
        return `${Radius}m`;
      }
    case 'available_sizes':
      return ski.sizes.join(', ');
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
    case 'weight_per_ski':
      // Dynamically update weight based on selected size
      if (selectedSize) {
        const weightIndex = ski.available_sizes.indexOf(selectedSize);
        if (weightIndex !== -1) {
          return `${ski.sizes[weightIndex].weight}g`;
        }
      }
    default:
      return String(ski[key as keyof Ski] || '');
  }
};


export default SkiComparison;