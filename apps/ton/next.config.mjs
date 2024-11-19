// next.config.mjs
const nextConfig = {
  // Enable React Strict Mode for catching potential issues in your app
  reactStrictMode: true,

  // Optimize image handling with Next.js' Image Optimization
  images: {
    domains: [], // Add domains for external images if needed
  },

  // Set custom environmental variables
  env: {
    CUSTOM_ENV_VAR: 'value', // Replace with your variables
  },

  // Add basePath if the app is served under a subdirectory
  basePath: '',

  // Adjust build output directory (default is `.next`)
  distDir: '.next',

  // Internationalization settings
  i18n: {
    locales: ['en'], // List of supported locales
    defaultLocale: 'en', // Default locale
  },
}

export default nextConfig
