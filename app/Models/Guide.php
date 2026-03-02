<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guide extends Model
{
    protected $fillable = [
        'full_name',
        'contact_number',
        'email',
        'id_type',
        'id_number',
        'id_image_path',
        'years_of_experience',
        'specialty_areas',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'specialty_areas' => 'array',
        'reviewed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get certifications for this guide.
     */
    public function certifications()
    {
        return $this->hasMany(GuideCertification::class);
    }

    /**
     * Guide availability records (for admin scheduling).
     */
    public function availabilities()
    {
        return $this->hasMany(\App\Models\GuideAvailability::class);
    }

    /**
     * Get the admin who reviewed this guide.
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Scope to get pending guides.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'Pending');
    }

    /**
     * Scope to get approved guides.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'Approved');
    }

    /**
     * Scope to get rejected guides.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'Rejected');
    }

    /**
     * Approve the guide.
     */
    public function approve(User $admin)
    {
        $this->update([
            'status' => 'Approved',
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
            'rejection_reason' => null,
        ]);
        return $this;
    }

    /**
     * Reject the guide.
     */
    public function reject(User $admin, string $reason = null)
    {
        $this->update([
            'status' => 'Rejected',
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
            'rejection_reason' => $reason,
        ]);
        return $this;
    }

    /**
     * Check if any certification is expiring soon (within 30 days).
     */
    public function hasExpiringCertifications()
    {
        return $this->certifications()
            ->whereDate('expiry_date', '<=', now()->addDays(30))
            ->whereDate('expiry_date', '>', now())
            ->exists();
    }

    /**
     * Check if any certification is expired.
     */
    public function hasExpiredCertifications()
    {
        return $this->certifications()
            ->whereDate('expiry_date', '<', now())
            ->exists();
    }

    /**
     * Get expiring certifications.
     */
    public function expiringCertifications()
    {
        return $this->certifications()
            ->whereDate('expiry_date', '<=', now()->addDays(30))
            ->whereDate('expiry_date', '>', now())
            ->get();
    }
}
