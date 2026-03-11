import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';
import { NotificationProvider } from './contexts/NotificationContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Force HTTPS for ngrok
if (typeof window !== 'undefined' && window.location.hostname.includes('ngrok')) {
    if (window.location.protocol === 'http:') {
        window.location.protocol = 'https:';
    }
}

// Configure axios
axios.defaults.baseURL = '/';

// Axios interceptor - only add CSRF token, don't modify URLs
axios.interceptors.request.use((config) => {
    // Add CSRF token for requests
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken && !config.headers['X-CSRF-TOKEN']) {
        config.headers['X-CSRF-TOKEN'] = csrfToken;
    }
    return config;
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <NotificationProvider>
                    <App {...props} />
                </NotificationProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
