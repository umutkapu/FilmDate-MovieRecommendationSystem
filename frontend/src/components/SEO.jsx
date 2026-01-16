import { Helmet } from 'react-helmet-async'

export default function SEO({ 
  title, 
  description, 
  image, 
  url,
  type = 'website'
}) {
  const baseUrl = 'https://filmdatemovies.com'
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullTitle = title ? `${title} | FilmDate` : 'FilmDate: Movie Recommendations'
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || 'Discover your next favorite movie with AI-powered recommendations.'} />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || 'Discover your next favorite movie with AI-powered recommendations.'} />
      <meta property="og:url" content={fullUrl} />
      {image && <meta property="og:image" content={image} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || 'Discover your next favorite movie with AI-powered recommendations.'} />
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Schema Markup */}
      {type === 'movie' && image && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Movie",
            "name": title,
            "image": image,
            "url": fullUrl
          })}
        </script>
      )}
      
      {type === 'person' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": title,
            "url": fullUrl,
            "image": image
          })}
        </script>
      )}
    </Helmet>
  )
}
