import { loadRedirects } from './redirects.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['172.25.48.1'],
  allowedDevOrigins: ['10.169.175.144'],
  images: {
    unoptimized: true,
  },
  // 301 redirects from the old website's URLs. Edit data/redirects.csv, not this file.
  async redirects() {
    return loadRedirects()
  },
}

export default nextConfig
