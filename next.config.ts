import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn2.thecatapi.com',
      },
    ],
  },
  turbopack: {
    rules: {
      '*.md': { loaders: ['raw-loader'], as: '*.js' },
      'src/libs/agent-sdk/skills/**/*.js': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin('./src/libs/i18n/request.ts');

export default withNextIntl(nextConfig);
