<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Inertia\Inertia;

class ActivityDetailController extends Controller
{
    public function show(Activity $activity)
    {
        $activity->load('faqs');
        $activities = Activity::where('status', 'active')->get();

        return Inertia::render('portal/activity-detail', [
            'activity' => $activity,
            'activities' => $activities,
        ]);
    }
}
