import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead: React.FC<SEOProps> = ({
  title = "Dad's Gift - Premium Real Estate Platform",
  description = "Find your perfect property with Dad's Gift - the premium real estate platform featuring warehouses, shops, and apartments with advanced search, interactive maps, and intelligent chatbot assistance.",
  keywords = "real estate, property, apartment, warehouse, shop, Mumbai, property search, real estate platform",
  image = "/pwa-512x512.png",
  url = window.location.href,
  type = "website"
}) => {
  const fullTitle = title.includes("Dad's Gift") ? title : `${title} | Dad's Gift`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Dad's Gift Team" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Dad's Gift" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#4f46e5" />
      <meta name="msapplication-TileColor" content="#4f46e5" />
      <meta name="application-name" content="Dad's Gift" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          "name": "Dad's Gift",
          "description": description,
          "url": url,
          "logo": image,
          "sameAs": [],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": "English"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead; 