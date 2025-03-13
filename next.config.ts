// next.config.ts
import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  trailingSlash: true,
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Provide fallbacks for modules that are not available in the browser.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,   // 'fs' is not available in the browser
        net: false,  // 'net' is not available in the browser
        tls: false,  // 'tls' is not available in the browser
        path: require.resolve("path-browserify"),
        os: require.resolve("os-browserify/browser"),
        stream: require.resolve("stream-browserify"),
        zlib: require.resolve("browserify-zlib"),
        buffer: require.resolve("buffer/")
      };

      // Automatically provide the Buffer polyfill when needed.
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"]
        })
      );
    }
    return config;
  }
};

export default nextConfig;
