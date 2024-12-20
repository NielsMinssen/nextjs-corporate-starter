import React from 'react';
import type { Metadata } from 'next';
import { LanguageProvider } from '../../components/LanguageContext';

type Language = 'en' | 'fr' | 'es';

interface Params {
  lang: Language;
}

// Function to generate metadata based on ski comparison and language
const getMetadata = (params: Params): Metadata => {
  // Define titles and descriptions in different languages
  const translations: Record<Language, { title: string; description: string }> = {
    en: {
      title: `Compare Skis - Find the Best Ski Models`,
      description: `Compare the top ski models with detailed specifications and insights. Find the best skis for your winter adventures.`,
    },
    fr: {
      title: `Comparer les Skis - Trouver les Meilleurs Modèles`,
      description: `Comparez les meilleurs modèles de skis avec des spécifications détaillées et des informations précises. Trouvez les skis idéaux pour vos aventures hivernales.`,
    },
    es: {
      title: `Comparar Skis - Encuentra los Mejores Modelos`,
      description: `Compara los principales modelos de esquís con especificaciones detalladas y análisis. Encuentra los esquís ideales para tus aventuras de invierno.`,
    },
  };

  // Return the metadata object
  return {
    title: translations[params.lang]?.title || translations.en.title,
    description: translations[params.lang]?.description || translations.en.description,
  };
};

// Export metadata as a function
export function generateMetadata({ params }: { params: Params }): Metadata {
  return getMetadata(params);
}

export default function Layout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Params;
}) {
  return (
    <LanguageProvider lang={params.lang}>
      <section>
        {children}
      </section>
    </LanguageProvider>
  );
}
