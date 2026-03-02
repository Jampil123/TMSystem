<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuideCertification extends Model
{
    protected $fillable = [
        'guide_id',
        'certification_name',
        'issued_by',
        'issued_date',
        'expiry_date',
        'certificate_file_path',
        'status',
    ];

    protected $casts = [
        'issued_date' => 'date',
        'expiry_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the guide this certification belongs to.
     */
    public function guide()
    {
        return $this->belongsTo(Guide::class);
    }

    /**
     * Check if certificate is expired.
     */
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    /**
     * Check if certificate is expiring soon (within 30 days).
     */
    public function isExpiringsoon(): bool
    {
        if (!$this->expiry_date) {
            return false;
        }
        return $this->expiry_date->diffInDays(now()) <= 30 && !$this->isExpired();
    }

    /**
     * Get days until expiry.
     */
    public function daysUntilExpiry(): ?int
    {
        if (!$this->expiry_date) {
            return null;
        }
        return $this->expiry_date->diffInDays(now(), false);
    }
}
