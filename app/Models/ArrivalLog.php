<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArrivalLog extends Model
{
    protected $table = 'arrival_logs';
    protected $primaryKey = 'log_id';
    public $timestamps = true;

    protected $fillable = [
        'guest_list_id',
        'guest_name',
        'guide_id',
        'arrival_time',
        'arrival_date',
        'status',
    ];

    protected $casts = [
        'arrival_date' => 'date',
        'arrival_time' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the guest list associated with this arrival log.
     */
    public function guestList()
    {
        return $this->belongsTo(GuestList::class, 'guest_list_id');
    }

    /**
     * Get the guide associated with this arrival log.
     */
    public function guide()
    {
        return $this->belongsTo(Guide::class, 'guide_id');
    }
}
