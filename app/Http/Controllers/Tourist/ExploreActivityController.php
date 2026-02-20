<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Inertia\Inertia;

class ExploreActivityController extends Controller
{
    public function index()
    {
        $activities = Activity::where('status', 'active')
            ->select('id', 'name', 'description', 'duration', 'difficulty_level', 'price', 'image_url', 'rating')
            ->paginate(12);

        return Inertia::render('tourist/explore/activities', [
            'activities' => $activities->through(fn ($activity) => [
                'id' => $activity->id,
                'title' => $activity->name,
                'description' => $activity->description,
                'duration' => $activity->duration,
                'difficulty' => $activity->difficulty_level,
                'rating' => $activity->rating ?? 0,
                'price' => '₱' . ($activity->price ?? '0'),
                'image' => $activity->image_url,
            ]),
        ]);
    }
}
