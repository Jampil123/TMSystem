<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccommodationService extends Model
{
    use HasFactory;

    protected $table = 'accommodation';
    protected $primaryKey = 'accommodation_id';

    protected $fillable = [
        'service_id',
        'room_type',
        'capacity',
        'price_per_night',
        'total_rooms',
    ];

    protected $casts = [
        'price_per_night' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the service that owns this accommodation.
     */
    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id', 'service_id');
    }

    /**
     * Get the operator (through service).
     */
    public function operator()
    {
        return $this->hasOneThrough(
            User::class,
            Service::class,
            'service_id',
            'id',
            'service_id',
            'operator_id'
        );
    }

    /**
     * Get the tourist spot (through service).
     */
    public function touristSpot()
    {
        return $this->hasOneThrough(
            Attraction::class,
            Service::class,
            'service_id',
            'id',
            'service_id',
            'tourist_spot_id'
        );
    }

    /**
     * Get available rooms (total rooms minus booked).
     */
    public function getAvailableRooms(): int
    {
        return $this->total_rooms; // Can be enhanced with booking logic later
    }

    /**
     * Check if accommodation has available capacity.
     */
    public function hasAvailability(): bool
    {
        return $this->getAvailableRooms() > 0;
    }
}
