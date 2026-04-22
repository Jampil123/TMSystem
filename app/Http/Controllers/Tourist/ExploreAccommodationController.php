<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Inertia\Inertia;

class ExploreAccommodationController extends Controller
{
    public function index()
    {
        $accommodations = Service::where('service_type', 'Accommodation')
            ->where('status', 'Approved')
            ->with('accommodation', 'touristSpot')
            ->select('service_id', 'service_name', 'description', 'tourist_spot_id', 'created_at')
            ->paginate(12);

        return Inertia::render('tourist/explore/accommodations', [
            'accommodations' => $accommodations->through(fn ($service) => [
                'id' => $service->service_id,
                'title' => $service->service_name,
                'description' => $service->description,
                'location' => $service->touristSpot?->location ?? 'Location not specified',
                'rating' => $service->touristSpot?->rating ?? 5.0,
                'image' => $service->touristSpot?->image_url ?? 'https://via.placeholder.com/400x300?text=' . urlencode($service->service_name),
                'type' => $service->accommodation?->room_type ?? 'Standard',
                'price' => '₱' . number_format($service->accommodation?->price_per_night ?? 0, 2) . '/night',
            ]),
        ]);
    }
}
