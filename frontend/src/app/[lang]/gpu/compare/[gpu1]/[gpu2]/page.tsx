import React from 'react';
import GPUComparison from '@/app/[lang]/components/GPUComparison';

import type { Metadata } from 'next';

type Language = 'en' | 'fr' | 'es';

interface Params {
  lang: Language;
  gpu1: string;
  gpu2: string;
}

// Function to generate metadata based on GPU names and language
const getMetadata = (params: Params): Metadata => {
  const gpu1 = decodeURIComponent(params.gpu1);
  const gpu2 = decodeURIComponent(params.gpu2);

  // Define titles and descriptions in different languages
  const translations: Record<Language, { title: string; description: string }> = {
    en: {
      title: `Compare ${gpu1} vs ${gpu2} | GPU Comparison`,
      description: `Compare performance, benchmarks, and specifications of ${gpu1} and ${gpu2}. Find out which GPU is best for gaming, productivity, and more.`,
    },
    fr: {
      title: `Comparer ${gpu1} et ${gpu2} | Comparaison de GPU`,
      description: `Comparez les performances, les benchmarks et les spécifications de ${gpu1} et ${gpu2}. Découvrez quel GPU est le meilleur pour le gaming, la productivité, et plus encore.`,
    },
    es: {
      title: `Comparar ${gpu1} vs ${gpu2} | Comparación de GPU`,
      description: `Compara el rendimiento, los benchmarks y las especificaciones de ${gpu1} y ${gpu2}. Descubre qué GPU es mejor para jugar, productividad, y más.`,
    },
  };

  // Return the correct metadata based on the language
  return translations[params.lang] || translations.en;
};

// Export metadata as a function call
export function generateMetadata({ params }: { params: Params }): Metadata {
  return getMetadata(params);
}

export default function ComparisonPage({ params }: { params: Params }) {
  const gpu1 = decodeURIComponent(params.gpu1);
  const gpu2 = decodeURIComponent(params.gpu2);

  return (
    <GPUComparison
      initialGpu1={gpu1}
      initialGpu2={gpu2}
      lang={params.lang}
    />
  );
}
