/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
        serverComponentsExternalPackages: ['pg', 'typeorm']
    },
    output: "standalone",
}

module.exports = nextConfig
