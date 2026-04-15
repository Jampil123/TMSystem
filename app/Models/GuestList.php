<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuestList extends Model
{
    protected $fillable = [
        'service_id',
        'attraction_id',
        'operator_id',
        'visit_date',
        'total_guests',
        'local_tourists',
        'foreign_tourists',
        'status',
        'notes',
        'guest_names',
    ];

    protected $casts = [
        'visit_date' => 'date',
        'guest_names' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the service this guest list belongs to.
     */
    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id', 'service_id');
    }

    /**
     * Get the operator this guest list belongs to.
     */
    public function operator()
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    /**
     * Get the attraction for this guest list (for walk-ins).
     */
    public function attraction()
    {
        return $this->belongsTo(Attraction::class, 'attraction_id');
    }

    /**
     * Get all QR codes for this guest list.
     */
    public function qrCodes()
    {
        return $this->hasMany(GuestListQRCode::class, 'guest_list_id');
    }

    /**
     * Get the guide assignment(s) for this guest list.
     *
     * Multiple guides may be assigned for different segments or roll‑overs.
     */
    public function assignments()
    {
        return $this->hasMany(\App\Models\GuideAssignment::class, 'guest_list_id');
    }
}