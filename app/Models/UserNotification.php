<?php

namespace App\Models;

use Illuminate\Notifications\DatabaseNotification;

/**
 * Custom DatabaseNotification model that points to `laravel_notifications`
 * instead of the default `notifications` table (which is used by the staff
 * QR-scanning event system and has incompatible columns).
 */
class UserNotification extends DatabaseNotification
{
    protected $table = 'laravel_notifications';
}
