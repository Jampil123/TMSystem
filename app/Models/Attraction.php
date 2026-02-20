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
    ];

    protected $table = 'attractions';
}
