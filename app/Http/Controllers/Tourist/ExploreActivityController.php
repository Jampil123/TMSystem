<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\ActivityService;
use Inertia\Inertia;

class ExploreActivityController extends Controller
{
    public function index()
    {
        $activities = ActivityService::join('services', 'activity.service_id', '=', 'services.service_id')
            ->leftJoin('attractions', 'services.tourist_spot_id', '=', 'attractions.id')
            ->where('services.status', 'Approved')
            ->select(
                'activity.activity_id as id',
                'services.service_name',
                'services.description',
                'services.service_type as type',
                'activity.activity_name',
                'activity.duration_minutes',
                'activity.max_participants',
                'activity.price_per_person as price',
                'activity.required_equipment',
                'attractions.location',
                'attractions.image_url',
                'attractions.rating'
            )
            ->paginate(12);

        return Inertia::render('tourist/activities', [
            'activities' => $activities->through(fn ($activity) => [
                'id' => $activity->id,
                'title' => $activity->activity_name,
                'location' => $activity->location ?? 'Location Not Specified',
                'price' => '₱' . ($activity->price ?? '0'),
                'rating' => $activity->rating ?? 0,
                'duration' => $activity->duration_minutes . ' mins' ?? 'Duration Not Specified',
                'capacity' => $activity->max_participants ?? 20,
                'image' => $activity->image_url ?? 'https://via.placeholder.com/300x200/375534/ffffff?text=Activity',
                'description' => $activity->description,
            ]),
        ]);
    }
}
