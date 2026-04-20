<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;

class PreventPendingUserLogin
{
    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        $user = $event->user;

        // Check if user exists and has account status
        if (! $user || ! $user->accountStatus) {
            return;
        }

        // If user status is PENDING (operator/staff registration), don't log them in
        if ($user->accountStatus->status === 'PENDING') {
            // User will not be logged in - they need admin approval first
            Auth::logout();
        }
    }
}
