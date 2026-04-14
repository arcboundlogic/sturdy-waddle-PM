/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@waddle/ui', '@waddle/types'],
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
};

export default nextConfig;
