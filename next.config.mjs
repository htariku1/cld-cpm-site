/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/cld-cpm-site',
  assetPrefix: '/cld-cpm-site/',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
