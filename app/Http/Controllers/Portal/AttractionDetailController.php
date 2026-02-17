<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Attraction;
use Inertia\Inertia;

class AttractionDetailController extends Controller
{
    public function show(Attraction $attraction)
    {
        $attractions = Attraction::where('status', 'active')->get();
        $activities = \App\Models\Activity::where('status', 'active')->get();

        return Inertia::render('portal/attraction-detail', [
            'attraction' => $attraction,
            'attractions' => $attractions,
            'activities' => $activities,
        ]);
    }
}
