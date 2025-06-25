import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      // Local development rewrites
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8080/api/:path*',
        },
      ];
    }

    // Production rewrites
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL}/api/:path*`, // Use the environment variable
      },
    ];
  },
};

export default nextConfig;