<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Accommodation extends Model
{
    protected $fillable = [
        'name',
        'description',
        'type',
        'location',
        'image_url',
        'rating',
        'status',
    ];

    protected $table = 'accommodations';
}
