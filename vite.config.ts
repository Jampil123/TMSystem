import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import {
    defineConfig
} from 'vite';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        // Change from 'localhost' to true to allow external access
        host: true,  // This allows access from external IPs and tunnels
        port: 5173,
        strictPort: true,  // Fail if port 5173 is already in use
        cors: true,  // Enable CORS for external requests
        // HMR configuration - use tunnel URL if available, otherwise localhost
        hmr: process.env.VITE_DEV_SERVER_URL ? {
            host: process.env.VITE_DEV_SERVER_URL.replace('https://', '').replace('http://', ''),
            port: 443,
            protocol: 'https',
        } : {
            host: 'localhost',
            port: 5173,
            protocol: 'http',
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
});