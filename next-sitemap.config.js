// next-sitemap.config.js
module.exports = {
    siteUrl: 'https://neuracities.com',
    generateRobotsTxt: true,
    robotsTxtOptions: {
      policies: [
        {
          userAgent: '*',
          allow: '/',
        },
      ],
      additionalSitemaps: [
        'https://neuracities.com/sitemap.xml',
        // Add other sitemaps if you have them
      ],
    },
    // Optional: exclude paths
    exclude: ['/admin', '/private-page'],
  }