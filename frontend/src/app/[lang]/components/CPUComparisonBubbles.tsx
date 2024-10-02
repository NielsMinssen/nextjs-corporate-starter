// components/CPUComparisonBubbles.tsx
import React from 'react';
import Link from 'next/link';

// Define the type for CPU comparison data
interface CPUComparisonData {
  cpu: string; // Use the same name for both CPU 1 and CPU 2
}

// Define props for the CPUComparisonBubbles component
interface CPUComparisonBubblesProps {
  comparisons: CPUComparisonData[];
  lang: 'fr' | 'es' | 'en'; // Define supported languages
}

const CPUComparisonBubbles: React.FC<CPUComparisonBubblesProps> = ({ comparisons, lang }) => {
  const getComparisonLink = (cpu1: string, cpu2: string) => {
    const cpu1Formatted = cpu1.replace(/ /g, '-');
      const cpu2Formatted = cpu2.replace(/ /g, '-');

    return `/${lang}/cpu/compare/${cpu1Formatted}-vs-${cpu2Formatted}`;
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
          const cpu1 = comparison.cpu.split(' vs ')[0]; // Split CPU names
          const cpu2 = comparison.cpu.split(' vs ')[1]; // Split CPU names
          
          return (
            <div key={index} className="flex flex-col items-center border rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
              <Link href={getComparisonLink(cpu1, cpu2)} className="text-center">
                <h3 className="text-xl font-semibold">{cpu1}</h3>
                <span className="text-gray-500">vs</span>
                <h3 className="text-xl font-semibold">{cpu2}</h3>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CPUComparisonBubbles;
