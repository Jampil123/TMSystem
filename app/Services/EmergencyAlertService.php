<?php

namespace App\Services;

use App\Models\EmergencyLog;
use App\Models\CapacityRule;
use App\Models\GuestList;
use App\Models\ArrivalLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EmergencyAlertService
{
    private const CAPACITY_EMERGENCY_THRESHOLD_PERCENT = 120; // 120% of max capacity triggers emergency
    private const UNSAFE_DENSITY_THRESHOLD = 6; // Visitors per square meter

    /**
     * Check if there's an active capacity emergency
     */
    public function hasCapacityEmergency(): bool
    {
        return EmergencyLog::active()
            ->byType('capacity_exceeded')
            ->exists();
    }

    /**
     * Check if there's an active unsafe density emergency
     */
    public function hasUnsafeDensityEmergency(): bool
    {
        return EmergencyLog::active()
            ->byType('unsafe_density')
            ->exists();
    }

    /**
     * Check if there's any active emergency
     */
    public function hasActiveEmergency(): bool
    {
        return EmergencyLog::active()->exists();
    }

    /**
     * Get all active emergencies
     */
    public function getActiveEmergencies()
    {
        return EmergencyLog::active()
            ->with('triggeredBy')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Check visitor capacity against emergency threshold
     */
    public function checkCapacityEmergency(): ?EmergencyLog
    {
        try {
            $config = CapacityRule::active();
            $currentVisitors = $this->getCurrentVisitorCount();
            $emergencyThreshold = ($config->max_visitors * self::CAPACITY_EMERGENCY_THRESHOLD_PERCENT) / 100;

            // If we're above 120% of max capacity
            if ($currentVisitors > $emergencyThreshold) {
                // Check if emergency already exists
                $existingEmergency = EmergencyLog::active()
                    ->byType('capacity_exceeded')
                    ->first();

                if (!$existingEmergency) {
                    $emergency = EmergencyLog::createCapacityExceeded(
                        $currentVisitors,
                        $config->max_visitors,
                        [
                            'emergency_threshold' => $emergencyThreshold,
                            'exceeds_by' => $currentVisitors - $config->max_visitors,
                            'percentage_over' => round(($currentVisitors / $config->max_visitors - 1) * 100, 2),
                        ]
                    );

                    // Broadcast emergency notifications
                    $this->broadcastEmergencyNotification($emergency);

                    return $emergency;
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Error checking capacity emergency: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Check for guest without guide assignment
     */
    public function checkMissingGuideEmergency(GuestList $guestList): ?EmergencyLog
    {
        try {
            // Check if guest group has confirmed guide
            $hasConfirmedGuide = $guestList->guideAssignment()
                ->where('status', '!=', 'cancelled')
                ->where('status', '!=', 'pending')
                ->exists();

            if (!$hasConfirmedGuide) {
                // Check if emergency already exists for this guest list
                $existingEmergency = EmergencyLog::byType('no_guide_assignment')
                    ->active()
                    ->where('details->guest_list_id', $guestList->id)
                    ->first();

                if (!$existingEmergency) {
                    $emergency = EmergencyLog::createNoGuideAssignment(
                        $guestList->id,
                        $guestList->total_guests,
                        ['group_name' => $guestList->group_name]
                    );

                    // Broadcast emergency notifications
                    $this->broadcastEmergencyNotification($emergency);

                    return $emergency;
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Error checking missing guide emergency: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Check visitor density levels for unsafe conditions
     */
    public function checkUnsafeDensityEmergency(): ?EmergencyLog
    {
        try {
            // Get estimated area (in square meters) - this can be configured per site
            $siteArea = config('app.site_area_sqm', 10000); // Default 10,000 m²

            $currentVisitors = $this->getCurrentVisitorCount();
            $currentDensity = $currentVisitors / ($siteArea / 10000); // Visitors per 100m²

            if ($currentDensity > self::UNSAFE_DENSITY_THRESHOLD) {
                // Check if emergency already exists
                $existingEmergency = EmergencyLog::active()
                    ->byType('unsafe_density')
                    ->first();

                if (!$existingEmergency) {
                    $emergency = EmergencyLog::createUnsafeDensity(
                        round($currentDensity, 2),
                        self::UNSAFE_DENSITY_THRESHOLD,
                        [
                            'site_area' => $siteArea,
                            'current_visitors' => $currentVisitors,
                        ]
                    );

                    // Broadcast emergency notifications
                    $this->broadcastEmergencyNotification($emergency);

                    return $emergency;
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Error checking unsafe density: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Trigger a manual emergency alert
     */
    public function triggerManualEmergency(User $user, string $title, string $description, $details = null): EmergencyLog
    {
        $emergency = EmergencyLog::createManual($user->id, $title, $description, $details);

        // Broadcast emergency notifications
        $this->broadcastEmergencyNotification($emergency);

        // Log the action
        Log::warning("Manual emergency triggered by {$user->name}: {$title}");

        return $emergency;
    }

    /**
     * Resolve an active emergency
     */
    public function resolveEmergency(EmergencyLog $emergency, ?User $user = null, $notes = null): void
    {
        $emergency->resolve($user?->id, $notes);

        // Broadcast resolution notification
        NotificationRouter::broadcastToRoles(
            type: 'emergency_resolved',
            title: 'Emergency Alert Resolved',
            message: "The following emergency has been resolved: {$emergency->title}",
            targetRoles: ['Admin', 'Tourism Staff'],
            severity: 'info',
            details: ['emergency_id' => $emergency->id, 'resolution_notes' => $notes],
            relatedEntityType: 'emergency_log',
            relatedEntityId: $emergency->id
        );

        Log::info("Emergency alert resolved: {$emergency->title}");
    }

    /**
     * Check if new entry should be blocked due to emergency
     */
    public function shouldBlockNewEntry(): bool
    {
        // Block entry if:
        // 1. Capacity emergency is active
        // 2. Unsafe density emergency is active
        return $this->hasCapacityEmergency() || $this->hasUnsafeDensityEmergency();
    }

    /**
     * Get current visitor count for today
     */
    private function getCurrentVisitorCount(): int
    {
        try {
            // Sum guest counts from guest_lists via arrival_logs with relationships
            $totalGuests = ArrivalLog::whereDate('created_at', today())
                ->where('status', '!=', 'denied')
                ->with('guestList')
                ->get()
                ->sum(function ($arrival) {
                    return $arrival->guestList?->total_guests ?? 0;
                });
            
            return $totalGuests ?? 0;
        } catch (\Exception $e) {
            Log::warning('Error calculating visitor count: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Broadcast emergency notification to relevant roles
     */
    private function broadcastEmergencyNotification(EmergencyLog $emergency): void
    {
        try {
            NotificationRouter::broadcastToRoles(
                type: 'emergency_alert',
                title: '🚨 ' . $emergency->title,
                message: $emergency->description,
                targetRoles: ['Admin', 'Tourism Staff'],
                severity: 'critical',
                details: $emergency->details,
                relatedEntityType: 'emergency_log',
                relatedEntityId: $emergency->id
            );
        } catch (\Exception $e) {
            Log::error('Error broadcasting emergency notification: ' . $e->getMessage());
        }
    }

    /**
     * Get emergency status for dashboard
     */
    public function getEmergencyStatus(): array
    {
        $activeEmergencies = EmergencyLog::active()->count();
        $recentResolved = EmergencyLog::resolved()
            ->where('resolved_at', '>=', now()->subHours(24))
            ->count();

        $emergencies = EmergencyLog::active()->get();
        $emergencyTypes = [];

        foreach ($emergencies as $emergency) {
            if (!isset($emergencyTypes[$emergency->emergency_type])) {
                $emergencyTypes[$emergency->emergency_type] = 0;
            }
            $emergencyTypes[$emergency->emergency_type]++;
        }

        return [
            'has_active' => $activeEmergencies > 0,
            'active_count' => $activeEmergencies,
            'recently_resolved_count' => $recentResolved,
            'emergency_types' => $emergencyTypes,
            'should_block_entry' => $this->shouldBlockNewEntry(),
        ];
    }
}
