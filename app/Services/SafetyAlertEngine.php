<?php

namespace App\Services;

use App\Models\SystemAlert;
use App\Models\CapacityRule;
use App\Models\GuideAssignment;
use App\Models\GuestList;
use App\Models\Guide;
use Illuminate\Support\Facades\DB;

class SafetyAlertEngine
{
    /**
     * Check all safety conditions and generate alerts
     */
    public function checkAllConditions(): void
    {
        $this->checkGuideTouGuestRatioViolations();
        $this->checkCapacityThresholds();
        $this->checkMissingGuideAssignments();
        $this->checkGuideScheduleConflicts();
    }

    /**
     * Check if any guide has been assigned more guests than allowed
     * Condition: Guide-to-guest ratio violation
     */
    public function checkGuideTouGuestRatioViolations(): void
    {
        $config = CapacityRule::active();
        $maxGuestsPerGuide = $config->max_guests_per_guide;

        // Get all active guide assignments with guest counts
        $violatingAssignments = GuideAssignment::with('guide', 'guestList')
            ->where('status', '!=', 'completed')
            ->where('status', '!=', 'cancelled')
            ->get()
            ->filter(function ($assignment) use ($maxGuestsPerGuide) {
                $guestCount = $assignment->guestList?->guest_count ?? 0;
                return $guestCount > $maxGuestsPerGuide;
            });

        foreach ($violatingAssignments as $assignment) {
            $guestCount = $assignment->guestList?->guest_count ?? 0;
            
            // Check if alert already exists for this assignment
            $existingAlert = SystemAlert::where('alert_type', 'guide_assignment_issue')
                ->where('is_resolved', false)
                ->where('details->guide_assignment_id', $assignment->id)
                ->exists();

            if (!$existingAlert) {
                SystemAlert::createGuideAssignmentIssue(
                    "Guide exceeds guest limit",
                    "Guide {$assignment->guide->name} is assigned {$guestCount} guests but max allowed is {$maxGuestsPerGuide}",
                    ['guide_assignment_id' => $assignment->id, 'guest_count' => $guestCount, 'max_allowed' => $maxGuestsPerGuide]
                );
            }
        }
    }

    /**
     * Check capacity thresholds and generate warnings/critical alerts
     * Condition: Capacity threshold warning and Maximum capacity exceeded
     */
    public function checkCapacityThresholds(): void
    {
        $config = CapacityRule::active();
        $currentVisitors = $this->getCurrentVisitorCount();
        $maxCapacity = $config->max_visitors;
        $warningThreshold = $config->warning_threshold_percent;
        $criticalThreshold = $config->critical_threshold_percent;

        $warningLevel = ($maxCapacity * $warningThreshold) / 100;
        $criticalLevel = ($maxCapacity * $criticalThreshold) / 100;

        // Check for critical capacity
        if ($currentVisitors >= $criticalLevel) {
            $existingCritical = SystemAlert::where('alert_type', 'capacity_critical')
                ->where('is_resolved', false)
                ->exists();

            if (!$existingCritical) {
                SystemAlert::createCapacityCritical(
                    "Maximum capacity reached",
                    "Current visitors ({$currentVisitors}) equals or exceeds maximum capacity ({$maxCapacity})",
                    [
                        'current_visitors' => $currentVisitors,
                        'max_capacity' => $maxCapacity,
                        'percentage' => round(($currentVisitors / $maxCapacity) * 100, 2)
                    ]
                );
            }
        } 
        // Check for warning capacity (only if not critical)
        elseif ($currentVisitors >= $warningLevel) {
            $existingWarning = SystemAlert::where('alert_type', 'capacity_warning')
                ->where('is_resolved', false)
                ->exists();

            if (!$existingWarning) {
                SystemAlert::createCapacityWarning(
                    "Capacity warning threshold reached",
                    "Current visitors ({$currentVisitors}) reached warning threshold ({$warningLevel})",
                    [
                        'current_visitors' => $currentVisitors,
                        'warning_threshold' => $warningLevel,
                        'percentage' => round(($currentVisitors / $maxCapacity) * 100, 2)
                    ]
                );
            }
        }
    }

    /**
     * Check for guest arrivals without confirmed guide assignment
     * Condition: Missing guide assignment
     */
    public function checkMissingGuideAssignments(): void
    {
        // Get guest lists that arrived today without a confirmed guide assignment
        $missingGuideAssignments = GuestList::with('guideAssignment', 'user')
            ->where('arrival_status', 'arrived')
            ->whereDate('created_at', today())
            ->get()
            ->filter(function ($guestList) {
                // Check if there's a confirmed guide assignment
                $hasConfirmedGuide = $guestList->guideAssignment()
                    ->where('status', '!=', 'cancelled')
                    ->where('status', '!=', 'pending')
                    ->exists();
                return !$hasConfirmedGuide;
            });

        foreach ($missingGuideAssignments as $guestList) {
            // Check if alert already exists
            $existingAlert = SystemAlert::where('alert_type', 'guide_unavailable')
                ->where('is_resolved', false)
                ->where('details->guest_list_id', $guestList->id)
                ->exists();

            if (!$existingAlert) {
                SystemAlert::createSystemError(
                    "Guest group without assigned guide",
                    "Guest group '{$guestList->group_name}' ({$guestList->guest_count} guests) arrived without a confirmed guide assignment",
                    ['guest_list_id' => $guestList->id, 'group_name' => $guestList->group_name, 'guest_count' => $guestList->guest_count]
                );
            }
        }
    }

    /**
     * Check for guide schedule conflicts
     * Condition: Guide schedule conflict
     */
    public function checkGuideScheduleConflicts(): void
    {
        // Get all active guide assignments grouped by guide
        $assignments = GuideAssignment::with('guide', 'guestList')
            ->where('status', '!=', 'completed')
            ->where('status', '!=', 'cancelled')
            ->get()
            ->groupBy('guide_id');

        foreach ($assignments as $guideId => $guideAssignments) {
            if ($guideAssignments->count() <= 1) {
                continue;
            }

            // Check if any assignments overlap in time
            $sortedAssignments = $guideAssignments->sortBy('start_time');
            
            foreach ($sortedAssignments as $i => $assignment1) {
                foreach ($sortedAssignments->slice($i + 1) as $assignment2) {
                    // Check if times overlap
                    if ($this->timesOverlap($assignment1, $assignment2)) {
                        // Check if alert already exists
                        $existingAlert = SystemAlert::where('alert_type', 'guide_assignment_issue')
                            ->where('is_resolved', false)
                            ->where('details->conflict_type', 'schedule_conflict')
                            ->where('details->guide_id', $guideId)
                            ->exists();

                        if (!$existingAlert) {
                            $guide = Guide::find($guideId);
                            SystemAlert::createGuideAssignmentIssue(
                                "Guide schedule conflict",
                                "Guide {$guide->name} has overlapping assignments at the same time",
                                [
                                    'guide_id' => $guideId,
                                    'conflict_type' => 'schedule_conflict',
                                    'assignment_1_id' => $assignment1->id,
                                    'assignment_2_id' => $assignment2->id
                                ]
                            );
                        }
                    }
                }
            }
        }
    }

    /**
     * Get current visitor count for today
     */
    private function getCurrentVisitorCount(): int
    {
        return DB::table('arrival_logs')
            ->where('status', '!=', 'denied')
            ->whereDate('created_at', today())
            ->sum('guest_count') ?? 0;
    }

    /**
     * Check if two time periods overlap
     */
    private function timesOverlap($assignment1, $assignment2): bool
    {
        $start1 = strtotime($assignment1->start_time ?? now());
        $end1 = strtotime($assignment1->end_time ?? now()->addHours(1));
        $start2 = strtotime($assignment2->start_time ?? now());
        $end2 = strtotime($assignment2->end_time ?? now()->addHours(1));

        return !($end1 <= $start2 || $end2 <= $start1);
    }

    /**
     * Resolve alerts for a specific condition when situation improves
     */
    public function resolveCapacityWarning(): void
    {
        $config = CapacityRule::active();
        $currentVisitors = $this->getCurrentVisitorCount();
        $warningLevel = ($config->max_visitors * $config->warning_threshold_percent) / 100;

        if ($currentVisitors < $warningLevel) {
            SystemAlert::where('alert_type', 'capacity_warning')
                ->where('is_resolved', false)
                ->get()
                ->each(fn($alert) => $alert->markResolved());
        }
    }

    /**
     * Resolve capacity critical alert
     */
    public function resolveCapacityCritical(): void
    {
        $config = CapacityRule::active();
        $currentVisitors = $this->getCurrentVisitorCount();
        $criticalLevel = ($config->max_visitors * $config->critical_threshold_percent) / 100;

        if ($currentVisitors < $criticalLevel) {
            SystemAlert::where('alert_type', 'capacity_critical')
                ->where('is_resolved', false)
                ->get()
                ->each(fn($alert) => $alert->markResolved());
        }
    }

    /**
     * Check a specific safety condition
     */
    public function checkCondition(string $condition): bool
    {
        return match($condition) {
            'guide_ratio' => $this->hasGuidoRatioViolation(),
            'capacity_warning' => $this->isAtWarningCapacity(),
            'capacity_critical' => $this->isAtCriticalCapacity(),
            'missing_guide' => $this->hasMissingGuideAssignments(),
            'schedule_conflict' => $this->hasScheduleConflicts(),
            default => false,
        };
    }

    private function hasGuidoRatioViolation(): bool
    {
        $config = CapacityRule::active();
        return GuideAssignment::with('guestList')
            ->where('status', '!=', 'completed')
            ->where('status', '!=', 'cancelled')
            ->get()
            ->some(fn($a) => ($a->guestList?->guest_count ?? 0) > $config->max_guests_per_guide);
    }

    private function isAtWarningCapacity(): bool
    {
        $config = CapacityRule::active();
        $current = $this->getCurrentVisitorCount();
        $warning = ($config->max_visitors * $config->warning_threshold_percent) / 100;
        return $current >= $warning && $current < ($config->max_visitors * $config->critical_threshold_percent) / 100;
    }

    private function isAtCriticalCapacity(): bool
    {
        $config = CapacityRule::active();
        $current = $this->getCurrentVisitorCount();
        $critical = ($config->max_visitors * $config->critical_threshold_percent) / 100;
        return $current >= $critical;
    }

    private function hasMissingGuideAssignments(): bool
    {
        return GuestList::with('guideAssignment')
            ->where('arrival_status', 'arrived')
            ->whereDate('created_at', today())
            ->get()
            ->some(function ($g) {
                return !$g->guideAssignment()
                    ->where('status', '!=', 'cancelled')
                    ->where('status', '!=', 'pending')
                    ->exists();
            });
    }

    private function hasScheduleConflicts(): bool
    {
        $assignments = GuideAssignment::where('status', '!=', 'completed')
            ->where('status', '!=', 'cancelled')
            ->get()
            ->groupBy('guide_id');

        foreach ($assignments as $guideAssignments) {
            if ($guideAssignments->count() > 1) {
                $sorted = $guideAssignments->sortBy('start_time');
                foreach ($sorted as $i => $a1) {
                    foreach ($sorted->slice($i + 1) as $a2) {
                        if ($this->timesOverlap($a1, $a2)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
}
