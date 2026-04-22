<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Attraction;
use App\Models\ArrivalLog;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class CrowdIdentifierController extends Controller
{
    public function index()
    {
        // Get all attractions with capacity info
        $attractions = Attraction::where('status', 'Active')
            ->with(['services' => function ($query) {
                $query->where('status', 'Approved');
            }])
            ->get();

        $crowdData = $attractions->map(function ($attraction) {
            // Count current guests (arrived today but not departed)
            $todayArrivals = ArrivalLog::whereHas('guestList', function ($query) use ($attraction) {
                $query->where('attraction_id', $attraction->id)
                    ->whereDate('visit_date', Carbon::today());
            })
            ->where('status', '!=', 'Departed')
            ->count();

            // Calculate crowd percentage
            $capacity = $attraction->capacity ?? 100; // Default to 100 if no capacity set
            $percentage = $capacity > 0 ? min(round(($todayArrivals / $capacity) * 100), 100) : 0;

            // Determine crowd level and status
            $crowdLevel = $this->getCrowdLevel($percentage);
            $status = $this->getStatus($percentage);
            $color = $this->getColorClass($percentage);

            return [
                'id' => $attraction->id,
                'location' => $attraction->name,
                'crowdLevel' => $crowdLevel,
                'percentage' => $percentage,
                'status' => $status,
                'estimated' => $todayArrivals . ' guests',
                'color' => $color,
                'capacity' => $capacity,
                'description' => $attraction->description,
            ];
        })
        ->sortByDesc('percentage')
        ->values();

        return Inertia::render('tourist/crowd-identifier', [
            'crowdData' => $crowdData,
        ]);
    }

    private function getCrowdLevel($percentage)
    {
        if ($percentage >= 80) {
            return 'Very High';
        } elseif ($percentage >= 60) {
            return 'High';
        } elseif ($percentage >= 40) {
            return 'Moderate';
        } elseif ($percentage >= 20) {
            return 'Low';
        } else {
            return 'Very Low';
        }
    }

    private function getStatus($percentage)
    {
        if ($percentage >= 80) {
            return 'Not Recommended';
        } elseif ($percentage >= 60) {
            return 'Busy';
        } elseif ($percentage >= 40) {
            return 'Manageable';
        } else {
            return 'Good Time';
        }
    }

    private function getColorClass($percentage)
    {
        if ($percentage >= 80) {
            return 'bg-red-500';
        } elseif ($percentage >= 60) {
            return 'bg-orange-500';
        } elseif ($percentage >= 40) {
            return 'bg-yellow-500';
        } else {
            return 'bg-green-500';
        }
    }
}
