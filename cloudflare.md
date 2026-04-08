terminal 1 - php artisan serve
terminal 2(laravel tunnel) - cloudflared tunnel --url http://localhost:8000
terminal 3(Vite tunnel) - cloudflared tunnel --url http://localhost:5173
terminal 4 - npm run dev