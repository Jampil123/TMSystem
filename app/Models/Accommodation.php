<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Accommodation extends Model
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
        'capacity' => 'integer',
        'price_per_night' => 'decimal:2',
        'total_rooms' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the service this accommodation belongs to.
     */
    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id', 'service_id');
    }
}
