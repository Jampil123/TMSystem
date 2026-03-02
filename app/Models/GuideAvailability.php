<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuideAvailability extends Model
{
    use HasFactory;

    protected $fillable = [
        'guide_id',
        'start_date',
        'end_date',
        'full_day',
        'status',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'full_day' => 'boolean',
    ];

    public function guide()
    {
        return $this->belongsTo(Guide::class);
    }
}
