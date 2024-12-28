/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['www.google.com'],
    unoptimized: true,
  }
}

module.exports = nextConfig 