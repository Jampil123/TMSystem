<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Attraction;
use App\Models\Activity;
use Inertia\Inertia;

class AboutController extends Controller
{
    /**
     * Show the about page
     */
    public function show()
    {
        $attractions = Attraction::where('status', 'active')->limit(3)->get();
        $activities = Activity::where('status', 'active')->limit(3)->get();

        return Inertia::render('portal/about', [
            'attractions' => $attractions,
            'activities' => $activities,
        ]);
    }
}
