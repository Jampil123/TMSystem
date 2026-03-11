<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get the origin from the request
        $origin = $request->header('Origin');
        
        // List of allowed origins (localhost, ngrok, etc.)
        $allowedOrigins = [
            'http://localhost:8000',
            'http://127.0.0.1:8000',
            'https://localhost:8000',
        ];
        
        // Allow ngrok tunnels (dynamic)
        if ($origin && (strpos($origin, 'ngrok') !== false || strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false)) {
            $allowedOrigins[] = $origin;
        }
        
        $response = $next($request);
        
        // If origin is allowed, add CORS headers
        if (in_array($origin, $allowedOrigins) || ($origin && strpos($origin, 'ngrok') !== false)) {
            $response->header('Access-Control-Allow-Origin', $origin);
            $response->header('Access-Control-Allow-Credentials', 'true');
            $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-TOKEN, X-Requested-With');
            $response->header('Access-Control-Max-Age', '86400');
        }
        
        // Handle preflight requests
        if ($request->getMethod() === 'OPTIONS') {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-TOKEN, X-Requested-With')
                ->header('Access-Control-Max-Age', '86400');
        }
        
        return $response;
    }
}
