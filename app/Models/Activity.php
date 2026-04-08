<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $table = 'activity';
    protected $primaryKey = 'activity_id';

    protected $fillable = [
        'service_id',
        'price_per_person',
        'duration_minutes',
        'max_participants',
        'required_equipment',
    ];

    protected $casts = [
        'price_per_person' => 'decimal:2',
        'duration_minutes' => 'integer',
        'max_participants' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the service this activity belongs to.
     */
    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id', 'service_id');
    }
}
