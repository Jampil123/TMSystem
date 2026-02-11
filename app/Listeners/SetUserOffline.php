<?php

namespace App\Listeners;

use App\Models\Userstatus;
use Illuminate\Auth\Events\Logout;

class SetUserOffline
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Logout $event): void
    {
        $offlineStatus = Userstatus::where('status', 'OFFLINE')
            ->where('type', 'ONLINE')
            ->first();
        
        $event->user->update(['online_status_id' => $offlineStatus?->id]);
    }
}
