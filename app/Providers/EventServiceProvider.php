<?php

namespace App\Providers;

use App\Listeners\SetUserOffline;
use App\Listeners\PreventPendingUserLogin;
use App\Listeners\LogLogin;
use App\Listeners\LogLogout;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Login::class => [
            LogLogin::class,
        ],
        Logout::class => [
            SetUserOffline::class,
            LogLogout::class,
        ],
        Registered::class => [
            PreventPendingUserLogin::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }
}
