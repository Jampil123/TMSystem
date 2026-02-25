<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OperatorProfile extends Model
{
    use HasFactory;

    protected $table = 'operator_profile';

    protected $fillable = [
        'user_id',
        'company_name',
        'contact_person',
        'contact_number',
        'business_address',
        'logo_path',
        'description',
    ];

    /**
     * Get the user that owns this profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
