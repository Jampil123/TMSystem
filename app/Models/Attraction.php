<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attraction extends Model
{
    protected $fillable = [
        'name',
        'description',
        'best_time_to_visit',
        'location',
        'category',
        'entry_fee',
        'image_url',
        'rating',
        'status',
        'latitude',
        'longitude',
        'capacity',
    ];

    protected $table = 'attractions';

    /**
     * Get all services available at this attraction.
     */
    public function services()
    {
        return $this->hasMany(Service::class, 'tourist_spot_id');
    }

    /**
     * Get approved services available at this attraction.
     */
    public function approvedServices()
    {
        return $this->services()->where('status', 'Approved');
    }
}
