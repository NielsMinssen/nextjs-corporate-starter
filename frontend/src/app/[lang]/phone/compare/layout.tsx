import React from 'react';
import type { Metadata } from 'next';
import { LanguageProvider } from '../../components/LanguageContext';

type Language = 'en' | 'fr' | 'es';

interface Params {
    lang: Language;
}

// Function to generate metadata based on GPU names and language
const getMetadata = (params: Params): Metadata => {
    // Define titles and descriptions in different languages
    const translations: Record<Language, { title: string; description: string }> = {
        en: {
            title: `Compare Phones - Find the Best Smartphones`,
            description: `Compare the top smartphones, from Apple, Samsung, and more, with detailed specifications and performance insights. Find the best phone for your needs.`,
        },
        fr: {
            title: `Comparer les Téléphones - Trouver les Meilleurs Smartphones`,
            description: `Comparez les meilleurs smartphones, d'Apple, Samsung, et plus, avec des spécifications détaillées et des informations sur les performances. Trouvez le meilleur téléphone pour vos besoins.`,
        },
        es: {
            title: `Comparar Teléfonos - Encuentra los Mejores Smartphones`,
            description: `Compara los principales smartphones, de Apple, Samsung, y más, con especificaciones detalladas y análisis de rendimiento. Encuentra el mejor teléfono para tus necesidades.`,
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