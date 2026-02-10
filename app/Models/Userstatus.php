<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Userstatus extends Model
{
    use HasFactory;

    protected $table = 'user_statuses';

    protected $fillable = [
        'status',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'user_status_id');
    }
}
