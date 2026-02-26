<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityService extends Model
{
    use HasFactory;

    protected $table = 'activity';
    protected $primaryKey = 'activity_id';

    protected $fillable = [
        'service_id',
        'activity_name',
        'price_per_person',
        'duration_minutes',
        'max_participants',
        'required_equipment',
    ];

    protected $casts = [
        'price_per_person' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the service that owns this activity.
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
     * Format duration as hours and minutes.
     */
    public function getFormattedDuration(): string
    {
        $hours = intdiv($this->duration_minutes, 60);
        $minutes = $this->duration_minutes % 60;
        
        if ($hours > 0 && $minutes > 0) {
            return "{$hours}h {$minutes}m";
        } elseif ($hours > 0) {
            return "{$hours}h";
        } else {
            return "{$minutes}m";
        }
    }
}
