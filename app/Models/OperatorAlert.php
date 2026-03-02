<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperatorAlert extends Model
{
    protected $fillable = [
        'operator_id',
        'alert_type',
        'priority_level',
        'tourist_group_name',
        'number_of_tourists',
        'assigned_guide_name',
        'activity_service_name',
        'activity_date_time',
        'description',
        'suggested_action',
        'status',
        'resolution_notes',
    ];

    protected $casts = [
        'activity_date_time' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the operator this alert belongs to.
     */
    public function operator()
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    /**
     * Scope to get active alerts.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    /**
     * Scope to get high priority alerts.
     */
    public function scopeHighPriority($query)
    {
        return $query->where('priority_level', 'High');
    }

    /**
     * Scope ordered by priority and date.
     */
    public function scopeOrderByPriority($query)
    {
        return $query->orderByRaw("FIELD(priority_level, 'High', 'Medium', 'Low')")
                     ->orderBy('created_at', 'desc');
    }

    /**
     * Mark alert as acknowledged.
     */
    public function acknowledge()
    {
        $this->update(['status' => 'Acknowledged']);
        return $this;
    }

    /**
     * Mark alert as resolved.
     */
    public function resolve($notes = null)
    {
        $this->update([
            'status' => 'Resolved',
            'resolution_notes' => $notes,
        ]);
        return $this;
    }
}
