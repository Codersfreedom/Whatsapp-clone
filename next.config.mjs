/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "content-dodo-569.convex.cloud" },
      {hostname:"imageurl"}
    ],
  },
};

export default nextConfig;
