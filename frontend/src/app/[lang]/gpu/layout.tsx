import React from 'react';
import type { Metadata } from 'next';
import { LanguageProvider } from '../components/LanguageContext';

type Language = 'en' | 'fr' | 'es';

interface Params {
  lang: Language;
}

// Function to generate metadata based on GPU names and language
const getMetadata = (params: Params): Metadata => {
  // Define titles and descriptions in different languages
  const translations: Record<Language, { title: string; description: string }> = {
    en: {
      title: `Compare GPUs - Find the Best Graphics Cards`,
      description: `Compare the top GPUs, from NVIDIA and AMD, with detailed specifications and performance insights. Find the best graphics card for your gaming or creative needs.`,
    },
    fr: {
      title: `Comparer les GPUs - Trouver les Meilleures Cartes Graphiques`,
      description: `Comparez les meilleures GPUs, de NVIDIA et AMD, avec des spécifications détaillées et des informations sur les performances. Trouvez la meilleure carte graphique pour vos besoins en jeu ou création.`,
    },
    es: {
      title: `Comparar GPUs - Encuentra las Mejores Tarjetas Gráficas`,
      description: `Compara las principales GPUs, de NVIDIA y AMD, con especificaciones detalladas y análisis de rendimiento. Encuentra la mejor tarjeta gráfica para tus necesidades de juegos o creativas.`,
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