<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\AccommodationService;
use App\Models\Service;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ExploreAccommodationController extends Controller
{
    public function index()
    {
        $accommodations = AccommodationService::join('services', 'accommodation.service_id', '=', 'services.service_id')
            ->leftJoin('attractions', 'services.tourist_spot_id', '=', 'attractions.id')
            ->where('services.status', 'Approved')
            ->select(
                'accommodation.accommodation_id as id',
                'services.service_name',
                'services.description',
                'services.facebook_url',
                'services.service_type as type',
                'accommodation.room_type',
                'accommodation.capacity',
                'accommodation.price_per_night as price',
                'accommodation.total_rooms',
                'attractions.location',
                'attractions.image_url',
                'attractions.rating'
            )
            ->paginate(12);

        return Inertia::render('tourist/accommodations', [
            'accommodations' => $accommodations->through(fn ($accommodation) => [
                'id' => $accommodation->id,
                'title' => $accommodation->service_name,
                'description' => $accommodation->description,
                'location' => $accommodation->location ?? 'Location Not Specified',
                'rating' => $accommodation->rating ?? 0,
                'image' => $accommodation->image_url ?? 'https://via.placeholder.com/300x200/375534/ffffff?text=Accommodation',
                'type' => $accommodation->type,
            ]),
        ]);
    }
}
