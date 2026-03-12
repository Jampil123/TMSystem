<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmergencyLog extends Model
{
    protected $fillable = [
        'emergency_type',
        'severity',
        'title',
        'description',
        'details',
        'triggered_by_user_id',
        'is_active',
        'resolved_at',
        'resolved_by_user_id',
        'resolution_notes',
    ];

    protected $casts = [
        'details' => 'array',
        'is_active' => 'boolean',
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who triggered the emergency alert
     */
    public function triggeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'triggered_by_user_id');
    }

    /**
     * Get the user who resolved the emergency alert
     */
    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by_user_id');
    }

    /**
     * Scope to get active emergency alerts
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get resolved emergency alerts
     */
    public function scopeResolved($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope to get alerts by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('emergency_type', $type);
    }

    /**
     * Scope to get recent alerts
     */
    public function scopeRecent($query, $minutes = 60)
    {
        return $query->where('created_at', '>=', now()->subMinutes($minutes));
    }

    /**
     * Scope to get critical alerts
     */
    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }

    /**
     * Mark emergency as resolved
     */
    public function resolve($userId = null, $notes = null): void
    {
        $this->is_active = false;
        $this->resolved_at = now();
        $this->resolved_by_user_id = $userId;
        $this->resolution_notes = $notes;
        $this->save();
    }

    /**
     * Create a capacity exceeded emergency
     */
    public static function createCapacityExceeded($currentVisitors, $maxCapacity, $details = null)
    {
        return self::create([
            'emergency_type' => 'capacity_exceeded',
            'severity' => 'critical',
            'title' => 'EMERGENCY: Site capacity exceeded',
            'description' => "Current visitor count ({$currentVisitors}) exceeds maximum allowed capacity ({$maxCapacity}). Immediate action required.",
            'details' => array_merge(['current_visitors' => $currentVisitors, 'max_capacity' => $maxCapacity], $details ?? []),
        ]);
    }

    /**
     * Create a no guide assignment emergency
     */
    public static function createNoGuideAssignment($guestListId, $guestCount, $details = null)
    {
        return self::create([
            'emergency_type' => 'no_guide_assignment',
            'severity' => 'critical',
            'title' => 'EMERGENCY: Guest group without guide',
            'description' => "Guest group ({$guestCount} guests) attempting entry without confirmed guide assignment. Entry blocked.",
            'details' => array_merge(['guest_list_id' => $guestListId, 'guest_count' => $guestCount], $details ?? []),
        ]);
    }

    /**
     * Create an unsafe density emergency
     */
    public static function createUnsafeDensity($visitorDensity, $maxDensity, $details = null)
    {
        return self::create([
            'emergency_type' => 'unsafe_density',
            'severity' => 'critical',
            'title' => 'EMERGENCY: Unsafe visitor density detected',
            'description' => "Visitor density ({$visitorDensity}/m²) exceeds safe limit ({$maxDensity}/m²). No new entries allowed.",
            'details' => array_merge(['current_density' => $visitorDensity, 'max_density' => $maxDensity], $details ?? []),
        ]);
    }

    /**
     * Create a manual emergency alert
     */
    public static function createManual($userId, $title, $description, $details = null)
    {
        return self::create([
            'emergency_type' => 'manual_trigger',
            'severity' => 'critical',
            'title' => "EMERGENCY: {$title}",
            'description' => $description,
            'triggered_by_user_id' => $userId,
            'details' => $details,
        ]);
    }

    /**
     * Create a system error emergency
     */
    public static function createSystemError($errorMessage, $details = null)
    {
        return self::create([
            'emergency_type' => 'system_error',
            'severity' => 'warning',
            'title' => 'System Error Detected',
            'description' => $errorMessage,
            'details' => $details,
        ]);
    }
}
