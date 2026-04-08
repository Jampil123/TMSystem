<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureUrls();
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }

    protected function configureUrls(): void
    {
        // Force HTTPS when behind a proxy (e.g., Cloudflare tunnel)
        if ($this->app->environment() !== 'production') {
            // Check if accessed through a tunnel (Cloudflare, ngrok, etc.)
            $host = request()->getHost();
            if (strpos($host, 'trycloudflare.com') !== false || strpos($host, 'ngrok') !== false) {
                // Force HTTPS for tunneled requests
                URL::forceScheme('https');
            }
        }
    }
}
