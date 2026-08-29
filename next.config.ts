/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Mematikan pengecekan ESLint saat deploy
  },
  typescript: {
    ignoreBuildErrors: true, // Mematikan pengecekan TypeScript saat deploy
  },
};

export default nextConfig;