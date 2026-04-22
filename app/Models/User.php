<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role_id',
        'account_status_id',
        'online_status_id',
        'documents_submitted_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'documents_submitted_at' => 'datetime',
        ];
    }

    /**
     * Get the user's role.
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the user's account status.
     */
    public function accountStatus()
    {
        return $this->belongsTo(Userstatus::class, 'account_status_id');
    }

    /**
     * Get the user's online status.
     */
    public function onlineStatus()
    {
        return $this->belongsTo(Userstatus::class, 'online_status_id');
    }

    /**
     * Get the user's profile (business details and profile picture).
     */
    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    /**
     * Get the user's operator profile (company information).
     */
    public function operatorProfile()
    {
        return $this->hasOne(OperatorProfile::class);
    }

    /**
     * Get the user's operator documents.
     */
    public function documents()
    {
        return $this->hasMany(OperatorDocument::class);
    }

    /**
     * Check if all operator documents are approved and uploaded.
     */
    public function hasAllDocumentsApproved(): bool
    {
        $documents = $this->documents()->get();
        
        if ($documents->isEmpty()) {
            return false;
        }

        return $documents->every(function ($doc) {
            return $doc->status === 'approved' && $doc->file_path && trim($doc->file_path) !== '';
        });
    }

    /**
     * Get all services provided by this operator.
     */
    public function services()
    {
        return $this->hasMany(Service::class, 'operator_id');
    }

    /**
     * Get all services approved by this admin.
     */
    public function approvedServices()
    {
        return $this->hasMany(Service::class, 'approved_by');
    }

    /**
     * Override the default notifications relationship to use the
     * `laravel_notifications` table (the default `notifications` table is
     * reserved for the staff QR-scanning event system with incompatible columns).
     */
    public function notifications(): MorphMany
    {
        return $this->morphMany(UserNotification::class, 'notifiable')->latest();
    }

    /**
     * Unread notifications using the custom table.
     */
    public function unreadNotifications(): MorphMany
    {
        return $this->morphMany(UserNotification::class, 'notifiable')
            ->whereNull('read_at')
            ->latest();
    }
}
