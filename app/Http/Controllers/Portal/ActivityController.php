<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $activities = Activity::query()
            ->with([
                'service' => function ($query) {
                    $query->select([
                        'service_id',
                        'tourist_spot_id',
                        'service_name',
                        'service_type',
                        'description',
                        'status',
                    ])->with(['touristSpot:id,name,location,image_url']);
                },
            ])
            ->whereHas('service', function ($query) use ($search) {
                $query->whereIn('service_type', ['Activity', 'activity', 'adventure', 'tour']);

                if ($search !== '') {
                    $query->where('service_name', 'like', '%' . $search . '%');
                }
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($activity) {
                $service = $activity->service;

                if (! $service) {
                    return null;
                }

                return [
                    'id' => $activity->activity_id,
                    'name' => $service->service_name,
                    'location' => $service->touristSpot?->location ?? 'Badian, Cebu',
                    'description' => $service->description ?: 'No description available.',
                    'price' => (float) ($activity->price_per_person ?? 0),
                    'image' => $service->touristSpot?->image_url,
                ];
            })
            ->filter()
            ->values();

        return Inertia::render('badian-portal/activities', [
            'activities' => $activities,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}

