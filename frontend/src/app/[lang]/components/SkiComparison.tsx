"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Select from "react-select";
import Loader from "@/app/[lang]/components/Loader";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';

interface SkiDimensions {
  tip_width: number;
  waist_width: number;
  tail_width: number;
}

interface RockerProfile {
  front: string;
  middle: string;
  tail: string;
}

interface Radius {
  min: number;
  max: number;
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
  radius: Radius;
  weight_per_ski: number;
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
  lang
}) => {
  const [skiList, setSkiList] = useState<Ski[]>([]);
  const [ski1, setSki1] = useState<string>(initialSki1);
  const [ski2, setSki2] = useState<string>(initialSki2);
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
          fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/skis`)
        ]);

        if (!translationsResponse.ok || !skisResponse.ok) {
          throw new Error("One or more network responses were not ok");
        }

        const translationsData = await translationsResponse.json();
        const skisData = await skisResponse.json();
        console.log(skisData);

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
          console.log("les skis", skis)

          const selectedSki1 = skis.find((ski: Ski) => ski.name === ski1);
          const selectedSki2 = skis.find((ski: Ski) => ski.name === ski2);

          if (selectedSki1 && selectedSki2) {
            setComparisonResult([selectedSki1, selectedSki2]);
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
  }, [lang, ski1, ski2]);

  const handleCompare = () => {
    if (ski1 && ski2) {
      router.push(`/${lang}/skis/compare/${ski1}-vs-${ski2}`);
    }
  };

  // Create data for the dimension comparison chart
  const getDimensionsData = (ski1: Ski, ski2: Ski) => {
    return [
      {
        position: 'Tip',
        [ski1.name]: ski1.dimensions.tip_width,
        [ski2.name]: ski2.dimensions.tip_width,
      },
      {
        position: 'Waist',
        [ski1.name]: ski1.dimensions.waist_width,
        [ski2.name]: ski2.dimensions.waist_width,
      },
      {
        position: 'Tail',
        [ski1.name]: ski1.dimensions.tail_width,
        [ski2.name]: ski2.dimensions.tail_width,
      },
    ];
  };

  if (isLoading) return <Loader />;
  if (!translations || !comparisonResult) return null;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-4xl font-bold mb-6 text-center">
        {translations.pages.comparison_page.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Select
          value={{ value: ski1, label: ski1 }}
          onChange={(option) => option && setSki1(option.value)}
          options={skiList.map(ski => ({ value: ski.name, label: ski.name }))}
          className="w-full"
        />
        <Select
          value={{ value: ski2, label: ski2 }}
          onChange={(option) => option && setSki2(option.value)}
          options={skiList.map(ski => ({ value: ski.name, label: ski.name }))}
          className="w-full"
        />
      </div>

      {comparisonResult && (
        <>
          {/* Dimensions Comparison Chart */}
          <div className="mb-8 p-6 bg-gray-50 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Ski Dimensions Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getDimensionsData(comparisonResult[0], comparisonResult[1])}>
                <XAxis dataKey="position" />
                <YAxis />
                <Legend />
                <RechartsTooltip />
                <Line
                  type="monotone"
                  dataKey={comparisonResult[0].name}
                  stroke="#8884d8"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey={comparisonResult[1].name}
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
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
const formatSkiValue = (ski: Ski, key: string): string => {
  switch (key) {
    case 'name':
      return formatSkiName(ski.name);
    case 'dimensions':
      return `${ski.dimensions.tip_width}/${ski.dimensions.waist_width}/${ski.dimensions.tail_width}`;
    case 'radius':
      return `${ski.radius.min}m - ${ski.radius.max}m`;
    case 'available_sizes':
      return ski.available_sizes.join(', ');
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
      return `${ski.weight_per_ski}g`;
    default:
      return String(ski[key as keyof Ski] || '');
  }
};

export default SkiComparison;