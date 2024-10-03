import React from 'react';
import type { Metadata } from 'next';
import { LanguageProvider } from '../components/LanguageContext';

type Language = 'en' | 'fr' | 'es';

interface Params {
  lang: Language;
}

// Function to generate metadata based on CPU names and language
const getMetadata = (params: Params): Metadata => {
  // Define titles and descriptions in different languages
  const translations: Record<Language, { title: string; description: string }> = {
    en: {
      title: `Compare CPUs - Find the Best Processors`,
      description: `Compare the top CPUs, from Intel and AMD, with detailed specifications and performance insights. Find the best processor for your computing or gaming needs.`,
    },
    fr: {
      title: `Comparer les CPUs - Trouver les Meilleurs Processeurs`,
      description: `Comparez les meilleurs CPUs, d'Intel et AMD, avec des spécifications détaillées et des informations sur les performances. Trouvez le meilleur processeur pour vos besoins en informatique ou en jeu.`,
    },
    es: {
      title: `Comparar CPUs - Encuentra los Mejores Procesadores`,
      description: `Compara los principales CPUs, de Intel y AMD, con especificaciones detalladas y análisis de rendimiento. Encuentra el mejor procesador para tus necesidades de computación o juegos.`,
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
    )
  }
