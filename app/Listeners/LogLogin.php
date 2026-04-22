<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use App\Services\AuditLogService;

class LogLogin
{
    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        AuditLogService::logLogin($event->user->email);
    }
}
