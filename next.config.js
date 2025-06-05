/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
    },
    serverExternalPackages: ['pg', 'typeorm', '@react-pdf/renderer'],
    output: "standalone",
    webpack: (config) => {
      config.resolve.alias.canvas = false;

      return config;
    },
}

module.exports = nextConfig
