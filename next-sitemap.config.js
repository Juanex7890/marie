/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://cojinesmarie.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/admin/*', '/api/*'],
  additionalPaths: async (config) => {
    const result = []
    
    // Add dynamic paths for categories and products
    // This would be populated from your database in a real implementation
    const categories = [
      'servilletas-lino',
      'cojines-uso-diario',
      'infantiles-personalizados',
      'rusticos',
      'navidad-2025',
      'toallas-navidenas'
    ]
    
    const products = [
      'cojin-lino-beige',
      'servilleta-lino-natural',
      'cojin-infantil-unicornio'
    ]
    
    categories.forEach(category => {
      result.push({
        loc: `/categoria/${category}`,
        changefreq: 'weekly',
        priority: 0.8,
      })
    })
    
    products.forEach(product => {
      result.push({
        loc: `/producto/${product}`,
        changefreq: 'monthly',
        priority: 0.9,
      })
    })
    
    return result
  },
}
