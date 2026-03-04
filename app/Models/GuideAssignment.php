<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class GuideAssignment extends Model
{
    protected $fillable = [
        'guest_list_id',
        'guide_id',
        'assignment_date',
        'start_time',
        'end_time',
        'guest_count',
        'assignment_status',
        'service_type',
        'notes',
        'assigned_by',
        'assigned_at',
        'compliance_status',
        'compliance_notes',
        'has_certification_warning',
        'has_availability_conflict',
    ];

    protected $casts = [
        'assignment_date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'assigned_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'has_certification_warning' => 'boolean',
        'has_availability_conflict' => 'boolean',
    ];

    /**
     * Get the guest list this assignment belongs to.
     */
    public function guestList(): BelongsTo
    {
        return $this->belongsTo(GuestList::class);
    }

    /**
     * Get the guide this assignment is for.
     */
    public function guide(): BelongsTo
    {
        return $this->belongsTo(Guide::class);
    }

    /**
     * Get the admin who made the assignment.
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Check if the assignment is valid (no conflicts, certification valid, etc).
     */
    public function isValid(): bool
    {
        return !$this->guide->certifications()->expired()->exists()
            && !$this->hasAvailabilityConflict()
            && $this->guide->status === 'Approved';
    }

    /**
     * Check if guide has availability conflict.
     */
    private function hasAvailabilityConflict(): bool
    {
        return $this->guide->availabilities()
            ->where('status', '!=', 'Available')
            ->whereBetween('start_date', [$this->start_time, $this->end_time])
            ->orWhereBetween('end_date', [$this->start_time, $this->end_time])
            ->exists();
    }

    /**
     * Scope to get pending assignments.
     */
    public function scopePending($query)
    {
        return $query->where('assignment_status', 'Pending');
    }

    /**
     * Scope to get confirmed assignments.
     */
    public function scopeConfirmed($query)
    {
        return $query->where('assignment_status', 'Confirmed');
    }

    /**
     * Scope to get active assignments (Pending or Confirmed).
     */
    public function scopeActive($query)
    {
        return $query->whereIn('assignment_status', ['Pending', 'Confirmed']);
    }

    /**
     * Scope to get flagged assignments.
     */
    public function scopeFlagged($query)
    {
        return $query->where('compliance_status', 'Flagged');
    }

    /**
     * Mark assignment as confirmed.
     */
    public function confirm(): void
    {
        $this->update([
            'assignment_status' => 'Confirmed',
            'assigned_at' => now(),
        ]);
    }

    /**
     * Mark assignment as completed.
     */
    public function complete(): void
    {
        $this->update([
            'assignment_status' => 'Completed',
        ]);
    }

    /**
     * Cancel the assignment.
     */
    public function cancel($reason = null): void
    {
        $this->update([
            'assignment_status' => 'Cancelled',
            'compliance_notes' => $reason,
        ]);
    }
}
