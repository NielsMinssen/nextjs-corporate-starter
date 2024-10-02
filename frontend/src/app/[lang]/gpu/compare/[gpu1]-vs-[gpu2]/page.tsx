import React from 'react';
import GPUComparison from '@/app/[lang]/components/GPUComparison';

import type { Metadata } from 'next';

type Language = 'en' | 'fr' | 'es';

interface Params {
  lang: Language;
  'gpu1]-vs-[gpu2': string;
}

// Function to generate metadata based on GPU names and language
const getMetadata = (params: Params): Metadata => {
  // Extraire la chaîne qui contient gpu1 et gpu2
  const gpuComparison = params['gpu1]-vs-[gpu2'];

  // Diviser la chaîne sur '-vs-' pour obtenir gpu1 et gpu2
  const [gpu1, gpu2] = gpuComparison.split('-vs-');

  // Déterminer l'URL canonique en utilisant l'ordre alphabétique
  const canonicalGpus = [gpu1, gpu2].sort(); // Tri alphabétique
  const canonicalUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/${params.lang}/gpu/compare/${canonicalGpus[0]}-vs-${canonicalGpus[1]}`;

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

  // Return the metadata object
  return {
    title: translations[params.lang]?.title || translations.en.title,
    description: translations[params.lang]?.description || translations.en.description,
    alternates: {
      canonical: canonicalUrl, // Ajout de l'URL canonique
    },
  };
};

// Export metadata as a function call
export function generateMetadata({ params }: { params: Params }): Metadata {
  return getMetadata(params);
}

export default function ComparisonPage({ params }: { params: Params }) {
  console.log(params);

  // Extraire la chaîne qui contient gpu1 et gpu2
  const gpuComparison = params['gpu1]-vs-[gpu2'];

  // Diviser la chaîne sur '-vs-' pour obtenir gpu1 et gpu2
  const [gpu1Extracted, gpu2Extracted] = gpuComparison.split('-vs-');
  const gpu1 = gpu1Extracted.replace(/-/g, ' ');
  const gpu2 = gpu2Extracted.replace(/-/g, ' ');  

  return (
    <GPUComparison
      initialGpu1={gpu1}
      initialGpu2={gpu2}
      lang={params.lang}
    />
  );
}
