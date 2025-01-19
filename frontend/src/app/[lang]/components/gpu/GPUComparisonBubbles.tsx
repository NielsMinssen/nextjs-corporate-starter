// components/GPUComparisonBubbles.tsx
import React from 'react';
import Link from 'next/link';

// Define the type for GPU comparison data
interface GPUComparisonData {
  gpu: string; // Use the same name for both GPU 1 and GPU 2
}

// Define props for the GPUComparisonBubbles component
interface GPUComparisonBubblesProps {
  comparisons: GPUComparisonData[];
  lang: 'fr' | 'es' | 'en'; // Define supported languages
}

const GPUComparisonBubbles: React.FC<GPUComparisonBubblesProps> = ({ comparisons, lang }) => {
  const getComparisonLink = (gpu1: string, gpu2: string) => {
    const gpu1Formatted = gpu1.replace(/ /g, '-');
      const gpu2Formatted = gpu2.replace(/ /g, '-');

    return `/${lang}/gpu/compare/${gpu1Formatted}-vs-${gpu2Formatted}`;
  };

  // Translations for the title and subtitles based on the language
  const translations = {
    en: {
      title: 'Popular Graphics Card Comparisons',
      subtitle: 'Here are some of the popular graphics card comparisons of late.',
    },
    fr: {
      title: 'Comparaisons de cartes graphiques populaires',
      subtitle: 'Voici quelques-unes des comparaisons de cartes graphiques populaires récemment.',
    },
    es: {
      title: 'Comparaciones populares de tarjetas gráficas',
      subtitle: 'Aquí hay algunas de las comparaciones de tarjetas gráficas más populares últimamente.',
    },
  };

  return (
    <div className='py-10'>
      <h2 className="text-2xl font-bold text-center mb-4">{translations[lang].title}</h2>
      <p className="text-center mb-6">{translations[lang].subtitle}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {comparisons.map((comparison, index) => {
          const gpu1 = comparison.gpu.split(' vs ')[0]; // Split GPU names
          const gpu2 = comparison.gpu.split(' vs ')[1]; // Split GPU names
          
          return (
            <div key={index} className="flex flex-col items-center border rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
              <Link href={getComparisonLink(gpu1, gpu2)} className="text-center">
                <h3 className="text-xl font-semibold">{gpu1}</h3>
                <span className="text-gray-500">vs</span>
                <h3 className="text-xl font-semibold">{gpu2}</h3>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GPUComparisonBubbles;
