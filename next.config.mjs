/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/pendaftaran/member',
        destination: '/backend/pendaftaran.html',
      },
    ];
  },
};

export default nextConfig;
