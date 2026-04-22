<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Inertia\Inertia;

class ExploreActivityController extends Controller
{
    public function index()
    {
        $activities = Service::where('service_type', 'Activity')
            ->where('status', 'Approved')
            ->with('activity', 'touristSpot')
            ->select('service_id', 'service_name', 'description', 'tourist_spot_id', 'created_at')
            ->paginate(12);

        return Inertia::render('tourist/explore/activities', [
            'activities' => $activities->through(fn ($service) => [
                'id' => $service->service_id,
                'title' => $service->service_name,
                'description' => $service->description,
                'duration' => $this->formatDuration($service->activity?->duration_minutes ?? 0),
                'difficulty' => 'Moderate',
                'rating' => $service->touristSpot?->rating ?? 5.0,
                'price' => '₱' . number_format($service->activity?->price_per_person ?? 0, 2),
                'image' => $service->touristSpot?->image_url ?? 'https://via.placeholder.com/400x300?text=' . urlencode($service->service_name),
            ]),
        ]);
    }

    private function formatDuration($minutes)
    {
        if ($minutes < 60) {
            return $minutes . ' mins';
        }
        
        $hours = floor($minutes / 60);
        $mins = $minutes % 60;
        
        if ($mins > 0) {
            return $hours . 'h ' . $mins . 'm';
        }
        
        return $hours . 'h';
    }
}
