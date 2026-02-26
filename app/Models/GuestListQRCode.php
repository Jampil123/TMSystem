<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuestListQRCode extends Model
{
    protected $table = 'guest_list_qr_codes';
    
    protected $fillable = [
        'guest_list_id',
        'token',
        'status',
        'expiration_date',
        'used_at',
    ];

    protected $casts = [
        'expiration_date' => 'date',
        'used_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the guest list this QR code belongs to.
     */
    public function guestList()
    {
        return $this->belongsTo(GuestList::class);
    }
}
