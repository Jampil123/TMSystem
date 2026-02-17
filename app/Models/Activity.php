<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Activity extends Model
{
    protected $fillable = [
        'name',
        'description',
        'duration',
        'difficulty_level',
        'max_participants',
        'price',
        'image_url',
        'rating',
        'package_information',
        'status',
    ];

    protected $casts = [
        'package_information' => 'array',
    ];

    public function faqs(): HasMany
    {
        return $this->hasMany(ActivityFaq::class)->orderBy('order');
    }
}
