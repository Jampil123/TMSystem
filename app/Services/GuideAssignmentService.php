<?php

namespace App\Services;

use App\Models\Guide;
use App\Models\GuestList;
use App\Models\GuideAssignment;
use App\Models\OperatorAlert;
use App\Notifications\GuideAssignedNotification;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class GuideAssignmentService
{
    /**
     * Get all eligible guides for assignment based on filters.
     *
     * @param GuestList $guestList
     * @param array $filters
     * @return Collection
     */
    public function getEligibleGuides(GuestList $guestList, array $filters = []): Collection
    {
        $guides = Guide::approved()
            ->with(['certifications', 'availabilities'])
            ->get()
            ->filter(function (Guide $guide) use ($guestList, $filters) {
                return $this->isGuideEligible($guide, $guestList, $filters);
            });

        return $guides;
    }

    /**
     * Check if a guide is eligible for assignment.
     *
     * RULES:
     * ❌ NEVER assign if:
     * - Certification expired
     * - Already assigned at same time
     * - Marked unavailable
     * - Compliance status = Flagged
     * - Already assigned to this guest list
     */
    private function isGuideEligible(Guide $guide, GuestList $guestList, array $filters): bool
    {
        // Rule 1: Check if guide status is Approved
        if ($guide->status !== 'Approved') {
            return false;
        }

        // Rule 2: Check for expired certifications
        if ($this->hasExpiredCertification($guide)) {
            return false;
        }

        // Rule 2.5: Check if guide is already assigned to this guest list
        if ($this->isAlreadyAssignedToGuestList($guide, $guestList)) {
            return false;
        }

        // Rule 3: Check for existing conflicts at same time (but allow same guest list)
        if ($this->hasTimeConflict($guide, $guestList->visit_date, $guestList)) {
            return false;
        }

        // Rule 4: Check availability status
        if ($this->isUnavailable($guide, $guestList->visit_date)) {
            return false;
        }

        // Rule 5: Check compliance status (if flagged, don't assign)
        if ($this->hasComplianceIssue($guide)) {
            return false;
        }

        // Rule 6: Check certification match (if service has required certification)
        if (isset($filters['required_certification'])) {
            if (!$this->hasCertification($guide, $filters['required_certification'])) {
                return false;
            }
        }

        // Rule 7: Check expertise/specialty match (OPTIONAL - only filter if guide has specialties)
        if (isset($filters['service_type'])) {
            $specialties = $guide->specialty_areas ?? [];
            // Only enforce specialty match if guide has specialties defined
            if (!empty($specialties)) {
                if (!$this->matchesSpecialty($guide, $filters['service_type'])) {
                    return false;
                }
            }
            // If guide has no specialties, allow them (they're flexible/multi-purpose guides)
        }

        return true;
    }

    /**
     * Check if guide has expired certifications.
     */
    private function hasExpiredCertification(Guide $guide): bool
    {
        $expiredCerts = $guide->certifications()
            ->where('expiry_date', '<', now())
            ->count();

        return $expiredCerts > 0;
    }

    /**
     * Check if guide is already assigned to this guest list.
     */
    private function isAlreadyAssignedToGuestList(Guide $guide, GuestList $guestList): bool
    {
        return GuideAssignment::where('guide_id', $guide->id)
            ->where('guest_list_id', $guestList->id)
            ->active()
            ->exists();
    }

    /**
     * Check if guide has required certification.
     */
    private function hasCertification(Guide $guide, string $certificationName): bool
    {
        return $guide->certifications()
            ->where('certification_name', 'LIKE', "%$certificationName%")
            ->where('expiry_date', '>=', now())
            ->exists();
    }

    /**
     * Check if guide has time conflict with existing assignments.
     * 
     * A guide can be assigned multiple times to the SAME guest list (1:1 ratio),
     * but cannot be double-booked on DIFFERENT guest lists at the same time.
     */
    private function hasTimeConflict(Guide $guide, Carbon|string $visitDate, ?GuestList $guestList = null): bool
    {
        $visitDate = is_string($visitDate) ? Carbon::parse($visitDate) : $visitDate;

        $query = GuideAssignment::where('guide_id', $guide->id)
            ->where('assignment_date', $visitDate)
            ->active();
        
        // If checking for a specific guest list, exclude it from the conflict check
        // This allows multiple guides to be assigned to the same guest list
        if ($guestList) {
            $query->where('guest_list_id', '!=', $guestList->id);
        }

        return $query->exists();
    }

    /**
     * Check if guide is unavailable on the date.
     */
    private function isUnavailable(Guide $guide, Carbon|string $visitDate): bool
    {
        $visitDate = is_string($visitDate) ? Carbon::parse($visitDate) : $visitDate;

        return $guide->availabilities()
            ->where('status', '!=', 'Available')
            ->where(function ($query) use ($visitDate) {
                $query->whereDate('start_date', '<=', $visitDate)
                    ->whereDate('end_date', '>=', $visitDate);
            })
            ->exists();
    }

    /**
     * Check if guide matches required specialty/service type.
     * 
     * If guide has no specialty areas defined, they are eligible anyway.
     * If they do have specialties, at least one must match the service type.
     */
    private function matchesSpecialty(Guide $guide, string $serviceType): bool
    {
        // Check if guide's specialty areas contain the service type
        $specialties = $guide->specialty_areas ?? [];

        // If no specialties defined, allow them through (unspecialized guides can still work)
        if (empty($specialties)) {
            return true;
        }

        foreach ($specialties as $specialty) {
            if (stripos($specialty, $serviceType) !== false || stripos($serviceType, $specialty) !== false) {
                return true;
            }
        }

        // Has specialties but none match service type
        return false;
    }

    /**
     * Check if guide has compliance issues.
     */
    private function hasComplianceIssue(Guide $guide): bool
    {
        $recentFlaggedAssignments = GuideAssignment::where('guide_id', $guide->id)
            ->where('compliance_status', 'Flagged')
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        return $recentFlaggedAssignments > 0;
    }

    /**
     * Assign a guide to a guest list.
     *
     * @param GuestList $guestList
     * @param Guide $guide
     * @param array $data
     * @return GuideAssignment
     */
    public function assignGuide(GuestList $guestList, Guide $guide, array $data, $assignedBy = null): GuideAssignment
    {
        // Validate that assignment is possible
        if (!$this->isGuideEligible($guide, $guestList, [])) {
            throw new \Exception('Guide is not eligible for assignment due to conflicts or compliance issues.');
        }

        // Enforce 1:1 safety ratio: check if we already have enough guides
        $alreadyAssigned = $guestList->assignments()->active()->count();
        if ($alreadyAssigned >= $guestList->total_guests) {
            throw new \Exception('All required guides have already been assigned for this guest list (1:1 safety ratio met).');
        }

        // Check if this guide is already assigned to this guest list
        $guidedAlreadyAssigned = $guestList->assignments()
            ->where('guide_id', $guide->id)
            ->active()
            ->exists();
        if ($guidedAlreadyAssigned) {
            throw new \Exception('This guide is already assigned to this guest list.');
        }

        // Check for warnings
        $certificationWarning = $this->hasCertificationExpiringSoon($guide);
        $availabilityConflict = $this->willCauseConflict($guide, $guestList);

        // Create the assignment
        $assignment = GuideAssignment::create([
            'guest_list_id' => $guestList->id,
            'guide_id' => $guide->id,
            'assignment_date' => $guestList->visit_date,
            'start_time' => $data['start_time'] ?? now()->setHour(8)->setMinute(0),
            'end_time' => $data['end_time'] ?? now()->setHour(17)->setMinute(0),
            'guest_count' => $guestList->total_guests,
            'service_type' => $data['service_type'] ?? null,
            'assignment_status' => 'Confirmed',
            'assigned_by' => $assignedBy?->id,
            'assigned_at' => now(),
            'has_certification_warning' => $certificationWarning,
            'has_availability_conflict' => $availabilityConflict,
            'compliance_status' => $this->determineComplianceStatus($guide, $certificationWarning, $availabilityConflict),
            'compliance_notes' => $data['notes'] ?? null,
        ]);

        // Generate alerts if needed
        $this->generateAlerts($assignment, $guide, $guestList, $certificationWarning, $availabilityConflict);

        // Notify guide (with error handling)
        try {
            $guide->notify(new GuideAssignedNotification($assignment, $guestList));
        } catch (\Exception $e) {
            // Log notification failure but don't break the assignment
            \Log::warning("Failed to notify guide {$guide->id}: " . $e->getMessage());
        }

        return $assignment;
    }

    /**
     * Check if guide has certification expiring soon (within 30 days).
     */
    private function hasCertificationExpiringSoon(Guide $guide): bool
    {
        return $guide->certifications()
            ->where('expiry_date', '<=', now()->addDays(30))
            ->where('expiry_date', '>=', now())
            ->exists();
    }

    /**
     * Check if assignment will cause conflicts.
     */
    private function willCauseConflict(Guide $guide, GuestList $guestList): bool
    {
        return GuideAssignment::where('guide_id', $guide->id)
            ->where('assignment_date', $guestList->visit_date)
            ->whereIn('assignment_status', ['Pending', 'Confirmed'])
            ->exists();
    }

    /**
     * Determine compliance status based on warnings.
     */
    private function determineComplianceStatus(Guide $guide, bool $certWarning, bool $availabilityConflict): string
    {
        if ($this->hasComplianceIssue($guide)) {
            return 'Flagged';
        }

        if ($certWarning || $availabilityConflict) {
            return 'Warning';
        }

        return 'Good';
    }

    /**
     * Generate alerts for assignment issues.
     */
    private function generateAlerts(GuideAssignment $assignment, Guide $guide, GuestList $guestList, bool $certWarning, bool $availabilityConflict): void
    {
        $alerts = [];

        if ($certWarning) {
            $alerts[] = "Guide certification expiring soon";
        }

        if ($availabilityConflict) {
            $alerts[] = "Potential schedule conflict detected";
        }

        if (!empty($alerts)) {
            // Generate tourist group name from service or guest list
            $serviceName = $guestList->service?->service_name ?? 'Guest Group';
            $touristGroupName = "{$serviceName} - {$guestList->total_guests} guests";

            OperatorAlert::create([
                'operator_id' => $guestList->operator_id,
                'alert_type' => 'Assignment Warning',
                'tourist_group_name' => $touristGroupName,
                'number_of_tourists' => $guestList->total_guests,
                'assigned_guide_name' => $guide->full_name,
                'activity_service_name' => $serviceName,
                'activity_date_time' => $assignment->start_time,
                'description' => implode(', ', $alerts),
                'status' => 'Unread',
            ]);
        }
    }

    /**
     * Auto-assign guides based on guest count (1:1 safety ratio).
     * Assigns multiple guides equal to total_guests.
     * Returns an array of assignments.
     */
    public function autoAssignMultipleGuides(GuestList $guestList, array $filters = [], $assignedBy = null): array
    {
        $requiredGuideCount = $guestList->total_guests;
        $assignedCount = $guestList->assignments()->active()->count();
        $guidesNeeded = $requiredGuideCount - $assignedCount;

        if ($guidesNeeded <= 0) {
            return []; // All guides already assigned
        }

        $assignments = [];

        for ($i = 0; $i < $guidesNeeded; $i++) {
            $assignment = $this->autoAssignGuide($guestList, $filters, $assignedBy);
            if ($assignment) {
                $assignments[] = $assignment;
            } else {
                break; // No more eligible guides
            }
        }

        return $assignments;
    }

    public function autoAssignGuide(GuestList $guestList, array $filters = [], $assignedBy = null): ?GuideAssignment
    {
        $eligibleGuides = $this->getEligibleGuides($guestList, $filters);

        if ($eligibleGuides->isEmpty()) {
            return null;
        }

        // Score each guide
        $scoredGuides = $eligibleGuides->map(function (Guide $guide) use ($guestList) {
            return [
                'guide' => $guide,
                'score' => $this->scoreGuide($guide, $guestList),
            ];
        })->sortByDesc('score');

        $selectedGuide = $scoredGuides->first()['guide'];

        return $this->assignGuide($guestList, $selectedGuide, [
            'service_type' => $filters['service_type'] ?? null,
        ], $assignedBy);
    }

    /**
     * Score a guide for auto-assignment.
     * Higher score = better choice
     */
    private function scoreGuide(Guide $guide, GuestList $guestList): float
    {
        $score = 100;

        // Penalize for current assignments (10 points per assignment)
        $currentAssignments = GuideAssignment::where('guide_id', $guide->id)
            ->active()
            ->count();
        $score -= ($currentAssignments * 10);

        // Penalize for certification expiring soon (15 points)
        if ($this->hasCertificationExpiringSoon($guide)) {
            $score -= 15;
        }

        // Reward for years of experience (0.5 points per year)
        $score += ($guide->years_of_experience * 0.5);

        // Reward for available time (5 points if completely available)
        if (!$this->isUnavailable($guide, $guestList->visit_date)) {
            $score += 5;
        }

        return $score;
    }

    /**
     * Get assignment summary for a guide on a specific date.
     */
    public function getGuideAssignmentSummary(Guide $guide, ?string $date = null): array
    {
        $date = $date ? Carbon::parse($date) : now();

        $assignments = GuideAssignment::where('guide_id', $guide->id)
            ->where('assignment_date', $date)
            ->active()
            ->get();

        return [
            'total_assignments' => $assignments->count(),
            'total_guests' => $assignments->sum('guest_count'),
            'assignments' => $assignments->map(function (GuideAssignment $assignment) {
                return [
                    'id' => $assignment->id,
                    'guest_list_id' => $assignment->guest_list_id,
                    'start_time' => $assignment->start_time->format('H:i'),
                    'end_time' => $assignment->end_time->format('H:i'),
                    'guest_count' => $assignment->guest_count,
                    'status' => $assignment->assignment_status,
                ];
            })->toArray(),
        ];
    }

    /**
     * Check if guide is available for manual assignment with details.
     */
    public function getGuideAvailabilityDetails(Guide $guide, ?string $date = null): array
    {
        $date = $date ? Carbon::parse($date) : null;

        $assignmentSummary = [];
        if ($date) {
            $assignmentSummary = $this->getGuideAssignmentSummary($guide, $date);
        }

        $expiredCerts = $guide->certifications()
            ->where('expiry_date', '<', now())
            ->get();

        $expiringSoonCerts = $guide->certifications()
            ->where('expiry_date', '<=', now()->addDays(30))
            ->where('expiry_date', '>=', now())
            ->get();

        return [
            'guide_id' => $guide->id,
            'is_available' => $guide->status === 'Approved' && $expiredCerts->isEmpty(),
            'expiry_status' => match (true) {
                !$expiredCerts->isEmpty() => 'Has Expired Certifications',
                !$expiringSoonCerts->isEmpty() => 'Certification Expiring Soon',
                default => 'All Certifications Valid',
            },
            'assignment_summary' => $assignmentSummary,
            'expired_certifications' => $expiredCerts->map(function ($cert) {
                return [
                    'name' => $cert->certification_name,
                    'expiry_date' => $cert->expiry_date->format('Y-m-d'),
                    'days_expired' => $cert->expiry_date->diffInDays(now()),
                ];
            })->toArray(),
            'expiring_soon_certifications' => $expiringSoonCerts->map(function ($cert) {
                return [
                    'name' => $cert->certification_name,
                    'expiry_date' => $cert->expiry_date->format('Y-m-d'),
                    'days_until_expiry' => $cert->expiry_date->diffInDays(now()),
                ];
            })->toArray(),
        ];
    }
}
