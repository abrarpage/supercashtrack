import type { Metadata } from "next";
import { getSiteUrl, siteConfig } from "./config";

interface GenerateMetadataParams {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image = siteConfig.ogImage,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  noindex = false,
}: GenerateMetadataParams): Metadata {
  const baseUrl = getSiteUrl();
  const fullTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const ogImageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
    robots: noindex ? "noindex, nofollow" : "index, follow",
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "id_ID",
      type: type === "article" ? "article" : "website",
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImageUrl],
    },
  };

  return metadata;
}
