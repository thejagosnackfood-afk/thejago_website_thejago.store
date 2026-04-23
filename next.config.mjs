/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: '/backend/:path*',
      },
    ];
  },
};

export default nextConfig;
