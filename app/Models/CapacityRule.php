<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CapacityRule extends Model
{
    protected $table = 'capacity_rules';

    protected $fillable = [
        'attraction_id',
        'max_visitors',
        'warning_threshold_percent',
        'critical_threshold_percent',
        'max_guests_per_guide',
        'max_daily_visitors',
    ];

    protected $casts = [
        'max_visitors' => 'integer',
        'warning_threshold_percent' => 'integer',
        'critical_threshold_percent' => 'integer',
        'max_guests_per_guide' => 'integer',
        'max_daily_visitors' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the active capacity rules (typically only one record exists)
     */
    public static function active()
    {
        return static::first() ?? static::create([
            'max_visitors' => 350,
            'warning_threshold_percent' => 80,
            'critical_threshold_percent' => 100,
            'max_guests_per_guide' => 20,
            'max_daily_visitors' => 500,
        ]);
    }

    /**
     * Relationship: Capacity rule belongs to an attraction
     */
    public function attraction()
    {
        return $this->belongsTo(Attraction::class);
    }

    /**
     * Check if current capacity triggers warning
     */
    public function isWarningLevel($currentVisitors): bool
    {
        $percentage = ($currentVisitors / $this->max_visitors) * 100;
        return $percentage >= $this->warning_threshold_percent && $percentage < $this->critical_threshold_percent;
    }

    /**
     * Check if current capacity is critical
     */
    public function isCriticalLevel($currentVisitors): bool
    {
        $percentage = ($currentVisitors / $this->max_visitors) * 100;
        return $percentage >= $this->critical_threshold_percent;
    }

    /**
     * Get safe capacity (before warning)
     */
    public function getSafeCapacity(): int
    {
        return (int)($this->max_visitors * ($this->warning_threshold_percent - 1) / 100);
    }
}
