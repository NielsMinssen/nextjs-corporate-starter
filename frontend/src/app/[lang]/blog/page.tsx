// Move this file to: app/[lang]/blog/page.tsx
import PageHeader from '@/app/[lang]/components/PageHeader';
import { fetchAPI } from '@/app/[lang]/utils/fetch-api';
import BlogList from '@/app/[lang]/views/blog-list';
import type { Metadata } from 'next';

// Define the type for supported languages
type SupportedLanguage = 'fr' | 'es' | 'en';

// Function to fetch all articles (now server-side)
async function getAllArticles(locale: SupportedLanguage) {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/articles`;
    const urlParamsObject = {
      sort: { createdAt: 'desc' },
      locale: locale,
      populate: {
        cover: { fields: ['url'] },
        category: {
          populate: '*',
        },
        authorsBio: {
          populate: '*',
        },
        seo: {
          populate: '*',
        },
      },
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = await fetchAPI(path, urlParamsObject, options);
    console.log('Articles response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return { data: [] };
  }
}

// Function to fetch all categories for better filtering
async function getAllCategories(locale: SupportedLanguage) {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/categories`;
    const urlParamsObject = {
      locale: locale,
      populate: '*',
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = await fetchAPI(path, urlParamsObject, options);
    return responseData;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { data: [] };
  }
}

// Function to fetch featured articles
async function getFeaturedArticles(locale: SupportedLanguage) {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/articles`;
    const urlParamsObject = {
      filters: { featured: true },
      sort: { createdAt: 'desc' },
      locale: locale,
      populate: {
        cover: { fields: ['url'] },
        category: { populate: '*' },
        authorsBio: { populate: '*' },
      },
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = await fetchAPI(path, urlParamsObject, options);
    return responseData;
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return { data: [] };
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const lang = params.lang as SupportedLanguage;

  const titles = {
    en: 'Blog - Latest Articles & Expert Insights',
    es: 'Blog - Últimos Artículos y Perspectivas de Expertos',
    fr: 'Blog - Derniers Articles et Perspectives d\'Experts'
  };

  const descriptions = {
    en: 'Discover our latest articles, expert insights, and thought-provoking content across various topics and categories.',
    es: 'Descubre nuestros últimos artículos, perspectivas de expertos y contenido estimulante en diversas temáticas y categorías.',
    fr: 'Découvrez nos derniers articles, perspectives d\'experts et contenu stimulant sur diverses thématiques et catégories.'
  };

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    keywords: lang === 'en' ? 'blog, articles, insights, expert content' :
      lang === 'es' ? 'blog, artículos, perspectivas, contenido experto' :
        'blog, articles, perspectives, contenu expert',
    openGraph: {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
    },
  };
}

// Main blog page component (now server component)
export default async function BlogPage({
  params
}: {
  params: { lang: string }
}) {
  const lang = params.lang as SupportedLanguage;

  // Validate language
  if (!['fr', 'es', 'en'].includes(lang)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex justify-center items-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Language Not Supported</h2>
          <p className="text-red-500">Unsupported language: {lang}</p>
          <div className="mt-4 text-sm text-gray-600">
            Supported: EN, ES, FR
          </div>
        </div>
      </div>
    );
  }

  // Fetch data in parallel for better performance
  const [articlesResult, categoriesResult, featuredResult] = await Promise.all([
    getAllArticles(lang),
    getAllCategories(lang),
    getFeaturedArticles(lang)
  ]);

  const articles = articlesResult?.data || [];
  const categories = categoriesResult?.data || [];
  const featuredArticles = featuredResult?.data || [];

  // Enhanced empty state
  if (articles.length === 0) {
    const emptyStateTexts = {
      en: {
        title: 'No Articles Yet',
        subtitle: 'We\'re working on creating amazing content for you!',
        description: 'Check back soon for insightful articles and expert perspectives.'
      },
      es: {
        title: 'Aún No Hay Artículos',
        subtitle: '¡Estamos trabajando en crear contenido increíble para ti!',
        description: 'Vuelve pronto para artículos perspicaces y perspectivas de expertos.'
      },
      fr: {
        title: 'Pas Encore d\'Articles',
        subtitle: 'Nous travaillons à créer un contenu formidable pour vous !',
        description: 'Revenez bientôt pour des articles perspicaces et des perspectives d\'experts.'
      }
    };

    const texts = emptyStateTexts[lang];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-8xl mb-8">📝</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{texts.title}</h1>
            <p className="text-xl text-gray-600 mb-6">{texts.subtitle}</p>
            <p className="text-gray-500">{texts.description}</p>
            <div className="mt-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full animate-pulse">
                <div className="w-8 h-8 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced page header content
  const pageHeaderContent = {
    en: {
      title: 'Articles',
      subtitle: 'Our latest posts'
    },
    es: {
      title: 'Artículos',
      subtitle: 'Nuestras últimas publicaciones'
    },
    fr: {
      title: 'Articles',
      subtitle: 'Nos dernières publications'
    }
  };


  const content = pageHeaderContent[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Page Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative">
          <PageHeader
            heading={content.title}
            text={content.subtitle}
          />
        </div>

      </div>

      {/* Enhanced Blog List with better spacing and background */}
      <div className="relative">
        <div className="container mx-auto px-4 py-12">
          <BlogList
            data={articles}
            currentLang={lang}
            categories={categories}
            featuredArticles={featuredArticles}
          />
        </div>


      </div>
    </div>
  );
}

// Enhanced static params generation with better error handling
export async function generateStaticParams() {
  try {
    const languages: SupportedLanguage[] = ['en', 'es', 'fr'];

    // You could optionally validate that content exists for each language
    // by making a quick API call to check article counts

    return languages.map(lang => ({ lang }));
  } catch (error) {
    console.error('Error generating static params:', error);
    // Fallback to default languages
    return [
      { lang: 'en' },
      { lang: 'es' },
      { lang: 'fr' },
    ];
  }
}