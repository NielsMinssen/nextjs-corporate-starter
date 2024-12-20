import React from 'react';
//import SkiComparison from '@/app/[lang]/components/SkiComparison';
import type { Metadata } from 'next';
import SkiComparison from '@/app/[lang]/components/SkiComparison';

type Language = 'en' | 'fr' | 'es';

interface Params {
  lang: Language;
  'ski1]-vs-[ski2': string;
}

// Function to generate metadata based on ski names and language
const getMetadata = (params: Params): Metadata => {
  // Extract the string containing ski1 and ski2
  const skiComparison = params['ski1]-vs-[ski2'];
  // Split the string on '-vs-' to get ski1 and ski2
  const [ski1, ski2] = skiComparison.split('-vs-');
  // Determine the canonical URL using alphabetical order
  const canonicalSkis = [ski1, ski2].sort(); // Alphabetical sort
  const canonicalUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/${params.lang}/ski/compare/${canonicalSkis[0]}-vs-${canonicalSkis[1]}`;

  // Define titles and descriptions in different languages
  const translations: Record<Language, { title: string; description: string }> = {
    en: {
      title: `Compare ${ski1} vs ${ski2} | Ski Comparison`,
      description: `Compare the specifications, dimensions, and features of ${ski1} and ${ski2}. Discover the best skis for your winter adventures.`,
    },
    fr: {
      title: `Comparer ${ski1} et ${ski2} | Comparaison de Skis`,
      description: `Comparez les spécifications, les dimensions et les caractéristiques de ${ski1} et ${ski2}. Découvrez les meilleurs skis pour vos aventures hivernales.`,
    },
    es: {
      title: `Comparar ${ski1} vs ${ski2} | Comparación de Skis`,
      description: `Compara las especificaciones, dimensiones y características de ${ski1} y ${ski2}. Descubre los mejores esquís para tus aventuras de invierno.`,
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
  // Extract the string containing ski1 and ski2
  const skiComparison = params['ski1]-vs-[ski2'];
  // Split the string on '-vs-' to get ski1 and ski2
  const [ski1Extracted, ski2Extracted] = skiComparison.split('-vs-');
  const ski1 = decodeURI(ski1Extracted).replace(/-/g, ' ').replace(/%40/g, '@');
  const ski2 = decodeURI(ski2Extracted).replace(/-/g, ' ').replace(/%40/g, '@');

  return (
    <SkiComparison
      initialSki1={ski1}
      initialSki2={ski2}
      lang={params.lang}
    />
  );
}
