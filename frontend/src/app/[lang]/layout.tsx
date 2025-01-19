import type { Metadata } from "next";
import "./globals.css";
import { getStrapiMedia, getStrapiURL } from "./utils/api-helpers";
import { fetchAPI } from "./utils/fetch-api";
import PlausibleProvider from 'next-plausible'

import { i18n } from "../../../i18n-config";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { FALLBACK_SEO } from "@/app/[lang]/utils/phone/constants";


async function getGlobal(lang: string): Promise<any> {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

  if (!token) throw new Error("The Strapi API Token environment variable is not set.");

  const path = `/global`;
  const options = { headers: { Authorization: `Bearer ${token}` } };

  const urlParamsObject = {
    populate: [
      "metadata.shareImage",
      "favicon",
      "notificationBanner.link",
      "navbar.links",
      "navbar.dropdownLinks",
      "navbar.dropdownLinks.links",
      "navbar.navbarLogo.logoImg",
      "footer.footerLogo.logoImg",
      "footer.menuLinks",
      "footer.legalLinks",
      "footer.socialLinks",
      //"footer.categories",
    ],
    locale: lang,
  };
  return await fetchAPI(path, urlParamsObject, options);
}

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const meta = await getGlobal(params.lang);

  if (!meta.data) return FALLBACK_SEO;

  const { metadata, favicon } = meta.data.attributes;
  const { url } = favicon.data.attributes;

  return {
    title: metadata.metaTitle,
    description: metadata.metaDescription,
    icons: {
      icon: [new URL(url, getStrapiURL())],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  readonly children: React.ReactNode;
  readonly params: { lang: string };
}) {
  const global = await getGlobal(params.lang);

  if (!global.data) return null;

  const { notificationBanner, navbar, footer } = global.data.attributes;

  const navbarLogoUrl = getStrapiMedia(
    navbar.navbarLogo.logoImg.data?.attributes.url
  );

  const footerLogoUrl = getStrapiMedia(
    footer.footerLogo.logoImg.data?.attributes.url
  );

  const links = navbar.links.map((link: any) => ({
    id: link.id,
    url: link.url, // Ensure this matches your data structure
    newTab: link.newTab, // Ensure this matches your data structure
    text: link.text, // Ensure this matches your data structure
  }));

  const dropdownLinks = (navbar.dropdownLinks || []).map((dropdown: any) => ({
    id: dropdown.id,
    title: dropdown.title, // Title of the dropdown
    links: (dropdown.links || []).map((link: any) => ({
      id: link.id,
      url: link.url, // Ensure this matches your data structure
      newTab: link.newTab, // Ensure this matches your data structure
      text: link.text, // Ensure this matches your data structure
    })),
  }));

  return (
    <html lang={params.lang}>
      <head>
        <PlausibleProvider domain="siliconcompare.com" customDomain="https://plausible.siliconcompare.com" selfHosted={true} />
      </head>
      <body>
        <Navbar
          links={links} // Pass normal links
          dropdownLinks={dropdownLinks} // Pass dropdown links separately
          logoUrl={navbarLogoUrl}
          logoText={navbar.navbarLogo.logoText}
        />

        <main className="dark:bg-black dark:text-gray-100 min-h-screen">
          {children}
        </main>

        <Banner data={notificationBanner} />

        <Footer
          logoUrl={footerLogoUrl}
          logoText={footer.footerLogo.logoText}
          menuLinks={footer.menuLinks}
          //categoryLinks={footer.categories.data}
          legalLinks={footer.legalLinks}
          socialLinks={footer.socialLinks}
        />
      </body>
    </html>
  );
}
