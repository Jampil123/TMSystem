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
        'type',
        'description',
    ];

    public function accountUsers()
    {
        return $this->hasMany(User::class, 'account_status_id');
    }

    public function onlineUsers()
    {
        return $this->hasMany(User::class, 'online_status_id');
    }
}
