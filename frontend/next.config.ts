import type { NextConfig } from "next";

// Backend Flask jalan di localhost:5000. Supaya browser cukup mengakses
// SATU alamat (http://localhost:3000) untuk semuanya -- termasuk halaman
// admin -- semua request /api/* dan /uploads/* diteruskan (proxy) ke
// backend Flask lewat rewrites di sini.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      { source: "/uploads/:path*", destination: `${BACKEND_URL}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
