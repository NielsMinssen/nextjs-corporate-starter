import React from 'react';
import PhoneComparison from '@/app/[lang]/components/phone/PhoneComparison';

import type { Metadata } from 'next';

type Language = 'en' | 'fr' | 'es';

interface Params {
  lang: Language;
  'phone1]-vs-[phone2': string;
}

// Function to generate metadata based on phone names and language
const getMetadata = (params: Params): Metadata => {
  // Extract the string that contains phone1 and phone2
  const phoneComparison = params['phone1]-vs-[phone2'];

  // Split the string on '-vs-' to get phone1 and phone2
  const [phone1, phone2] = phoneComparison.split('-vs-');

  // Determine the canonical URL using alphabetical order
  const canonicalPhones = [phone1, phone2].sort(); // Alphabetical sort
  const canonicalUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/${params.lang}/phone/compare/${canonicalPhones[0]}-vs-${canonicalPhones[1]}`;

  // Define titles and descriptions in different languages
  const translations: Record<Language, { title: string; description: string }> = {
    en: {
      title: `Compare ${phone1} vs ${phone2} | Phone Comparison`,
      description: `Compare performance, features, and specifications of ${phone1} and ${phone2}. Find out which phone is best for your needs.`,
    },
    fr: {
      title: `Comparer ${phone1} et ${phone2} | Comparaison de Téléphones`,
      description: `Comparez les performances, les fonctionnalités et les spécifications de ${phone1} et ${phone2}. Découvrez quel téléphone est le meilleur pour vos besoins.`,
    },
    es: {
      title: `Comparar ${phone1} vs ${phone2} | Comparación de Teléfonos`,
      description: `Compara el rendimiento, las características y las especificaciones de ${phone1} y ${phone2}. Descubre qué teléfono es mejor para tus necesidades.`,
    },
  };

  // Return the metadata object
  return {
    title: translations[params.lang]?.title || translations.en.title,
    description: translations[params.lang]?.description || translations.en.description,
    alternates: {
      canonical: canonicalUrl, // Adding the canonical URL
    },
  };
};

// Export metadata as a function call
export function generateMetadata({ params }: { params: Params }): Metadata {
  return getMetadata(params);
}

export default function ComparisonPage({ params }: { params: Params }) {
  console.log(params);

  // Extract the string that contains phone1 and phone2
  const phoneComparison = params['phone1]-vs-[phone2'];

  // Split the string on '-vs-' to get phone1 and phone2
  const [phone1Extracted, phone2Extracted] = phoneComparison.split('-vs-');
  const phone1 = phone1Extracted.replace(/-/g, ' ');
  const phone2 = phone2Extracted.replace(/-/g, ' ');
  //console.log(phone1, phone2);

  return (
    <PhoneComparison
      initialPhone1={phone1}
      initialPhone2={phone2}
      lang={params.lang}
    />
  );
}
