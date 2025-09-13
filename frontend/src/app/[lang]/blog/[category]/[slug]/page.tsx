// Move file to: app/[lang]/[slug]/page.tsx
import { fetchAPI } from '@/app/[lang]/utils/fetch-api';
import Post from '@/app/[lang]/views/post';
import type { Metadata } from 'next';

async function getPostBySlug(slug: string, locale: string) {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/articles`;
    const urlParamsObject = {
        filters: { slug },
        locale, // Add locale filter
        populate: {
            cover: { fields: ['url'] },
            authorsBio: { populate: '*' },
            category: { fields: ['name'] },
            blocks: {
                populate: {
                    '__component': '*',
                    'files': '*',
                    'file': '*',
                    'url': '*',
                    'body': '*',
                    'title': '*',
                    'author': '*',
                }
            },
        },
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const response = await fetchAPI(path, urlParamsObject, options);
    return response;
}

async function getMetaData(slug: string, locale: string) {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/articles`;
    const urlParamsObject = {
        filters: { slug },
        locale, // Add locale filter
        populate: { seo: { populate: '*' } },
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const response = await fetchAPI(path, urlParamsObject, options);
    return response.data;
}

export async function generateMetadata({
    params
}: {
    params: { slug: string; lang: string }
}): Promise<Metadata> {
    const meta = await getMetaData(params.slug, params.lang);
    const metadata = meta[0].attributes.seo;
    return {
        title: metadata.metaTitle,
        description: metadata.metaDescription,
    };
}

export default async function PostRoute({
    params
}: {
    params: { slug: string; lang: string }
}) {
    const { slug, lang } = params;
    const data = await getPostBySlug(slug, lang);
    if (data.data.length === 0) return <h2>no post found</h2>;
    return <Post data={data.data[0]} />;
}

export async function generateStaticParams() {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/articles`;
    const options = { headers: { Authorization: `Bearer ${token}` } };

    // Generate for each locale
    const locales = ['en', 'es', 'fr']; // Your supported locales
    const allParams = [];

    for (const lang of locales) {
        const articleResponse = await fetchAPI(
            path,
            {
                locale: lang,
                populate: ['category'],
            },
            options
        );

        const langParams = articleResponse.data.map((article: any) => ({
            slug: article.attributes.slug,
            lang
        }));

        allParams.push(...langParams);
    }

    return allParams;
}