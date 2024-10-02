import React from 'react';
import CPUComparison from '@/app/[lang]/components/CPUComparison';
import type { Metadata } from 'next';

type Language = 'en' | 'fr' | 'es';

interface Params {
  lang: Language;
  'cpu1]-vs-[cpu2': string;
}

// Function to generate metadata based on CPU names and language
const getMetadata = (params: Params): Metadata => {
  // Extract the string containing cpu1 and cpu2
  const cpuComparison = params['cpu1]-vs-[cpu2'];
  // Split the string on '-vs-' to get cpu1 and cpu2
  const [cpu1, cpu2] = cpuComparison.split('-vs-');
  // Determine the canonical URL using alphabetical order
  const canonicalCpus = [cpu1, cpu2].sort(); // Alphabetical sort
  const canonicalUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/${params.lang}/cpu/compare/${canonicalCpus[0]}-vs-${canonicalCpus[1]}`;

  // Define titles and descriptions in different languages
  const translations: Record<Language, { title: string; description: string }> = {
    en: {
      title: `Compare ${cpu1} vs ${cpu2} | CPU Comparison`,
      description: `Compare performance, benchmarks, and specifications of ${cpu1} and ${cpu2}. Find out which CPU is best for various computing tasks, productivity, and more.`,
    },
    fr: {
      title: `Comparer ${cpu1} et ${cpu2} | Comparaison de CPU`,
      description: `Comparez les performances, les benchmarks et les spécifications de ${cpu1} et ${cpu2}. Découvrez quel CPU est le meilleur pour diverses tâches informatiques, la productivité, et plus encore.`,
    },
    es: {
      title: `Comparar ${cpu1} vs ${cpu2} | Comparación de CPU`,
      description: `Compara el rendimiento, los benchmarks y las especificaciones de ${cpu1} y ${cpu2}. Descubre qué CPU es mejor para varias tareas de computación, productividad, y más.`,
    },
  };

  // Return the metadata object
  return {
    title: translations[params.lang]?.title || translations.en.title,
    description: translations[params.lang]?.description || translations.en.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
};

// Export metadata as a function call
export function generateMetadata({ params }: { params: Params }): Metadata {
  return getMetadata(params);
}

export default function ComparisonPage({ params }: { params: Params }) {
  // Extract the string containing cpu1 and cpu2
  const cpuComparison = params['cpu1]-vs-[cpu2'];
  // Split the string on '-vs-' to get cpu1 and cpu2
  const [cpu1Extracted, cpu2Extracted] = cpuComparison.split('-vs-');
  const cpu1 = decodeURI(cpu1Extracted).replace(/-/g, ' ').replace(/%40/g, '@');
  const cpu2 = decodeURI(cpu2Extracted).replace(/-/g, ' ').replace(/%40/g, '@');

  return (
    <CPUComparison
      initialCpu1={cpu1}
      initialCpu2={cpu2}
      lang={params.lang}
    />
  );
}