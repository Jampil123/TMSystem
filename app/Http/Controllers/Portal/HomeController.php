<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Attraction;
use App\Models\Activity;
use App\Models\Accommodation;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $attractions = Attraction::where('status', 'active')->get();
        $activities = Activity::where('status', 'active')->get();
        $accommodations = Accommodation::where('status', 'active')->get();

        return Inertia::render('portal/home', [
            'attractions' => $attractions,
            'activities' => $activities,
            'accommodations' => $accommodations,
        ]);
    }
}
