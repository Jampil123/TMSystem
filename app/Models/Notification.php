<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'notification_type',
        'severity',
        'title',
        'message',
        'details',
        'related_entity_type',
        'related_entity_id',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the notification
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get unread notifications
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope to get notifications for a specific type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }
    }

    /**
     * Get time ago for display (e.g., "2 minutes ago")
     */
    public function getTimeAgoAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * Get the icon for the notification type
     */
    public function getIconAttribute(): string
    {
        return match($this->notification_type) {
            'success' => '✓',
            'warning' => '⚠',
            'error' => '✕',
            'info' => 'i',
            default => 'i',
        };
    }

    /**
     * Get the color class for the notification type
     */
    public function getColorClassAttribute(): string
    {
        return match($this->notification_type) {
            'success' => 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
            'warning' => 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
            'error' => 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700',
            'info' => 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
            default => 'bg-gray-100 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700',
        };
    }

    /**
     * Get text color class
     */
    public function getTextColorAttribute(): string
    {
        return match($this->notification_type) {
            'success' => 'text-green-800 dark:text-green-300',
            'warning' => 'text-yellow-800 dark:text-yellow-300',
            'error' => 'text-red-800 dark:text-red-300',
            'info' => 'text-blue-800 dark:text-blue-300',
            default => 'text-gray-800 dark:text-gray-300',
        };
    }
}
