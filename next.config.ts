import type { NextConfig } from "next";

// Turbopack evaluates modules at dev time; production does not need eval.
const scriptSrc =
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

// Enforcing Content-Security-Policy.
// - connect-src is limited to the Supabase project (REST + realtime) and Vercel
//   Speed Insights, which are the only cross-origin requests the app makes.
// - img-src and frame-src stay permissive over https so external program
//   artwork and embedded media keep loading.
// - 'unsafe-inline' is required until a nonce-based policy is wired through a
//   request proxy; everything else is locked down.
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com",
  "frame-src 'self' https:",
  "media-src 'self' https://*.supabase.co",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

// Feature policy: keep camera/microphone/geolocation available to the app
// itself (member avatars and locale lookup) and switch off everything else.
const permissionsPolicy = [
  "camera=(self)",
  "microphone=(self)",
  "geolocation=(self)",
  "payment=()",
  "usb=()",
  "serial=()",
  "midi=()",
  "magnetometer=()",
  "gyroscope=()",
  "accelerometer=()",
  "browsing-topics=()",
  "interest-cohort=()",
].join(", ");

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Permissions-Policy",
    value: permissionsPolicy,
  },
] as const;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityHeaders],
      },
    ];
  },
};

export default nextConfig;
