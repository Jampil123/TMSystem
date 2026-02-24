<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OperatorDocument extends Model
{
    use HasFactory;

    protected $table = 'operator_documents';

    protected $fillable = [
        'user_id',
        'name',
        'file_path',
        'status',
        'uploaded_date',
        'expires_date',
        'notes',
    ];

    protected $casts = [
        'uploaded_date' => 'date:Y-m-d',
        'expires_date' => 'date:Y-m-d',
    ];

    /**
     * Get the user that owns this document.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
