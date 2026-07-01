process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_36e54b4f9dc46dee19104bcbde266f89022ae61e7dad2d05d19d7d0c70c7c81e"
process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.shinokute.com"
process.env.NEXT_PUBLIC_DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"


const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
}

module.exports = nextConfig
