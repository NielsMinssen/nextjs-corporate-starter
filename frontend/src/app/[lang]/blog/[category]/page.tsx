// Move this file to: app/[lang]/blog/[category]/page.tsx
import PageHeader from '@/app/[lang]/components/PageHeader';
import { fetchAPI } from '@/app/[lang]/utils/fetch-api';
import BlogList from '@/app/[lang]/views/blog-list';

type SupportedLanguage = 'fr' | 'es' | 'en';

async function fetchPostsByCategory(
    filter: string,
    locale: SupportedLanguage
) {
    try {
        const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
        const path = `/articles`;
        const urlParamsObject = {
            sort: { createdAt: 'desc' },
            locale: locale,
            filters: {
                category: {
                    slug: filter,
                },
            },
            populate: {
                cover: { fields: ['url'] },
                category: { populate: '*' },
                authorsBio: { populate: '*' },
                seo: { populate: '*' },
            },
        };
        const options = { headers: { Authorization: `Bearer ${token}` } };
        const responseData = await fetchAPI(path, urlParamsObject, options);
        return responseData;
    } catch (error) {
        console.error('Error fetching posts by category:', error);
        return { data: [] };
    }
}

export default async function CategoryRoute({
    params,
}: {
    params: { lang: string; category: string };
}) {
    const lang = params.lang as SupportedLanguage;
    const filter = params.category;

    // validate language
    if (!['fr', 'es', 'en'].includes(lang)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Unsupported language: {lang}</p>
            </div>
        );
    }

    const { data } = await fetchPostsByCategory(filter, lang);
    if (!data || data.length === 0) {
        const noPostsTexts = {
            en: 'No posts in this category yet.',
            es: 'Aún no hay publicaciones en esta categoría.',
            fr: 'Pas encore d’articles dans cette catégorie.',
        };

        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>{noPostsTexts[lang]}</p>
            </div>
        );
    }

    // Category info from first article
    const { name, description } = data[0]?.attributes.category.data.attributes;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <PageHeader heading={name} text={description} />
            <div className="container mx-auto px-4 py-12">
                <BlogList
                    data={data}
                    currentLang={lang}
                // you can also pass categories + featuredArticles if needed
                />
            </div>
        </div>
    );
}

export async function generateStaticParams() {
    try {
        const languages: SupportedLanguage[] = ['en', 'es', 'fr'];
        // For simplicity, return all languages; could also prefetch categories per lang
        return languages.flatMap((lang) => [
            { lang, category: 'tech' },
            { lang, category: 'lifestyle' },
            // TODO: ideally fetch categories dynamically
        ]);
    } catch (error) {
        console.error('Error generating static params:', error);
        return [{ lang: 'en', category: 'general' }];
    }
}
