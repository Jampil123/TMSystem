<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $table = 'services';
    protected $primaryKey = 'service_id';

    protected $fillable = [
        'operator_id',
        'tourist_spot_id',
        'service_type',
        'service_name',
        'description',
        'facebook_url',
        'status',
        'approved_by',
        'approved_at',
        'remarks',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the operator (user) that provides this service.
     */
    public function operator()
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    /**
     * Get the tourist spot (attraction) where this service is available.
     */
    public function touristSpot()
    {
        return $this->belongsTo(Attraction::class, 'tourist_spot_id');
    }

    /**
     * Get the admin who approved this service.
     */
    public function approvedByAdmin()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Check if service is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === 'Approved';
    }

    /**
     * Check if service is pending approval.
     */
    public function isPending(): bool
    {
        return $this->status === 'Pending';
    }

    /**
     * Approve the service.
     */
    public function approve(int $adminId, string $remarks = null): bool
    {
        return $this->update([
            'status' => 'Approved',
            'approved_by' => $adminId,
            'approved_at' => now(),
            'remarks' => $remarks,
        ]);
    }

    /**
     * Reject the service.
     */
    public function reject(int $adminId, string $remarks): bool
    {
        return $this->update([
            'status' => 'Rejected',
            'approved_by' => $adminId,
            'approved_at' => now(),
            'remarks' => $remarks,
        ]);
    }

    /**
     * Request revision on the service.
     */
    public function requestRevision(int $adminId, string $remarks): bool
    {
        return $this->update([
            'status' => 'Revision Required',
            'approved_by' => $adminId,
            'approved_at' => now(),
            'remarks' => $remarks,
        ]);
    }

    /**
     * Get activity details if service is an activity.
     */
    public function activity()
    {
        return $this->hasOne(Activity::class, 'service_id', 'service_id');
    }

    /**
     * Get accommodation details if service is accommodation.
     */
    public function accommodation()
    {
        return $this->hasOne(Accommodation::class, 'service_id', 'service_id');
    }
}
