/** @type {import('next').NextConfig} */
const nextConfig = {
  // Retirer output: 'export' pour utiliser le mode serveur avec Netlify
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    CUSTOM_KEY: 'oskar-app',
  },
  async redirects() {
    // Anciennes routes OKR migrées sous /app/okr/*
    const okrRoutes = [
      'dashboard',
      'canvas',
      'management',
      'actions',
      'progress',
      'focus',
      'check-in',
      'retrospective',
      'reports',
    ];
    return okrRoutes.map((route) => ({
      source: `/${route}`,
      destination: `/app/okr/${route}`,
      permanent: false,
    }));
  },
}

module.exports = nextConfig
