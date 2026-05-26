import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // standalone output creates symlinks — requires Windows Developer Mode.
  // Only enable in CI/Linux where symlinks work without elevated permissions.
  output: process.env['CI'] ? 'standalone' : undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Transpile internal workspace packages
  transpilePackages: ['@ofs/ui', '@ofs/utils', '@ofs/types', '@ofs/validation', '@ofs/api-contracts'],

  images: {
    // Explicit allowlist — no wildcard domains
    remotePatterns: [],
  },

  serverExternalPackages: ['@prisma/client'],
};

export default withNextIntl(nextConfig);
