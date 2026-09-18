import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // Server Actions default to a 1MB request body — too small for a real
  // product photo straight off a phone or camera. Product image uploads
  // (app/admin/products/actions.ts uploadProductImage) go through a Server
  // Action, so this needs raising to fit real photography.
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // Temporary — curated, relevant Wikimedia Commons photos until real
      // photography is assigned per section. See lib/catalog-shared.ts
      // (COMMONS_FILE_BY_SEED) for the mapping and swap-out point.
      { protocol: "https" as const, hostname: "commons.wikimedia.org" },
      { protocol: "https" as const, hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
