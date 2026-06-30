/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['exceljs'],
  distDir: process.env.NEXT_PUBLIC_TENANT === 'exercito' ? '.next-exercito' : '.next',
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
