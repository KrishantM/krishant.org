/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Keep the Anthropic SDK in the Node.js runtime only — it is used exclusively
    // in the /api/ask route and must never be bundled into any client chunk.
    serverComponentsExternalPackages: ["@anthropic-ai/sdk"],
  },
};

export default nextConfig;
