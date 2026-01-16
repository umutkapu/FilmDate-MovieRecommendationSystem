// Bu dosya build sonrası sitemap.xml'i dinamik olarak güncellemek için kullanılabilir
// Şu anda temel sitemap struktur sağlanmıştır

export const generateDynamicSitemap = (movies = [], actors = []) => {
  const baseUrl = 'https://filmdate.com'
  const now = new Date().toISOString().split('T')[0]

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  // Home page
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${now}</lastmod>\n    <priority>1.0</priority>\n  </url>\n`

  // Trending page
  xml += `  <url>\n    <loc>${baseUrl}/trending</loc>\n    <lastmod>${now}</lastmod>\n    <priority>0.9</priority>\n  </url>\n`

  // Movies
  movies.forEach(movie => {
    xml += `  <url>\n    <loc>${baseUrl}/movie/${movie.id}</loc>\n    <priority>0.7</priority>\n  </url>\n`
  })

  // Actors
  actors.forEach(actor => {
    xml += `  <url>\n    <loc>${baseUrl}/actor/${actor.id}</loc>\n    <priority>0.6</priority>\n  </url>\n`
  })

  xml += '</urlset>'
  return xml
}
