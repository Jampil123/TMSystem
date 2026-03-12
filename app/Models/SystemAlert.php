<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class SystemAlert extends Model
{
    protected $table = 'system_alerts';

    protected $fillable = [
        'alert_type',
        'title',
        'message',
        'severity',
        'target_role',
        'is_resolved',
        'resolved_at',
        'details',
    ];

    protected $casts = [
        'is_resolved' => 'boolean',
        'details' => 'json',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    /**
     * Scope to get unresolved alerts
     */
    public function scopeUnresolved($query)
    {
        return $query->where('is_resolved', false);
    }

    /**
     * Scope to get alerts by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('alert_type', $type);
    }

    /**
     * Scope to get alerts by severity
     */
    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope to get alerts by target role
     */
    public function scopeForRole($query, $role)
    {
        return $query->where('target_role', $role)
            ->orWhere('target_role', 'all');
    }

    /**
     * Scope to get recent alerts (last 24 hours)
     */
    public function scopeRecent($query)
    {
        return $query->where('created_at', '>=', Carbon::now()->subDay());
    }

    /**
     * Mark alert as resolved
     */
    public function markResolved(): void
    {
        $this->update([
            'is_resolved' => true,
            'resolved_at' => now(),
        ]);
    }

    /**
     * Get color class for alert severity
     */
    public function getSeverityColorClass(): string
    {
        return match($this->severity) {
            'critical' => 'bg-red-100 text-red-800 border-red-300',
            'high' => 'bg-orange-100 text-orange-800 border-orange-300',
            'medium' => 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'low' => 'bg-blue-100 text-blue-800 border-blue-300',
            default => 'bg-gray-100 text-gray-800 border-gray-300',
        };
    }

    /**
     * Get icon for alert type
     */
    public function getTypeIcon(): string
    {
        return match($this->alert_type) {
            'capacity_warning' => '⚠️',
            'capacity_critical' => '🔴',
            'guide_assignment_issue' => '👤',
            'invalid_qr' => '❌',
            'security_breach' => '🔒',
            'system_error' => '⚙️',
            'maintenance_required' => '🔧',
            'booking_issue' => '📅',
            'guide_unavailable' => '❓',
            'duplicate_entry' => '⛔',
            default => 'ℹ️',
        };
    }

    /**
     * Create a capacity warning alert
     */
    public static function createCapacityWarning($currentVisitors, $maxCapacity, $percentage): self
    {
        return static::create([
            'alert_type' => 'capacity_warning',
            'title' => 'Capacity Warning',
            'message' => "Site is at {$percentage}% capacity ({$currentVisitors}/{$maxCapacity} visitors)",
            'severity' => 'high',
            'target_role' => 'staff',
            'details' => [
                'current_visitors' => $currentVisitors,
                'max_capacity' => $maxCapacity,
                'percentage' => $percentage,
            ],
        ]);
    }

    /**
     * Create a capacity critical alert
     */
    public static function createCapacityCritical($currentVisitors, $maxCapacity): self
    {
        return static::create([
            'alert_type' => 'capacity_critical',
            'title' => '🔴 CRITICAL: Site at Maximum Capacity',
            'message' => "URGENT: Site has reached maximum capacity ({$currentVisitors}/{$maxCapacity} visitors). No more guests can enter.",
            'severity' => 'critical',
            'target_role' => 'all',
            'details' => [
                'current_visitors' => $currentVisitors,
                'max_capacity' => $maxCapacity,
            ],
        ]);
    }

    /**
     * Create a guide assignment issue alert
     */
    public static function createGuideAssignmentIssue($guestListId, $reason): self
    {
        return static::create([
            'alert_type' => 'guide_assignment_issue',
            'title' => 'Guide Assignment Issue',
            'message' => "Guide assignment problem for booking #{$guestListId}: {$reason}",
            'severity' => 'high',
            'target_role' => 'staff',
            'details' => [
                'guest_list_id' => $guestListId,
                'reason' => $reason,
            ],
        ]);
    }

    /**
     * Create an invalid QR alert
     */
    public static function createInvalidQR($qrCode, $reason): self
    {
        return static::create([
            'alert_type' => 'invalid_qr',
            'title' => 'Invalid QR Code Scanned',
            'message' => "QR code {$qrCode} is invalid: {$reason}",
            'severity' => 'medium',
            'target_role' => 'staff',
            'details' => [
                'qr_code' => $qrCode,
                'reason' => $reason,
            ],
        ]);
    }

    /**
     * Create a security breach alert
     */
    public static function createSecurityBreach($description): self
    {
        return static::create([
            'alert_type' => 'security_breach',
            'title' => 'Security Alert',
            'message' => $description,
            'severity' => 'critical',
            'target_role' => 'admin',
            'details' => ['description' => $description],
        ]);
    }

    /**
     * Create a system error alert
     */
    public static function createSystemError($errorMessage): self
    {
        return static::create([
            'alert_type' => 'system_error',
            'title' => 'System Error',
            'message' => $errorMessage,
            'severity' => 'high',
            'target_role' => 'admin',
            'details' => ['error' => $errorMessage],
        ]);
    }
}
