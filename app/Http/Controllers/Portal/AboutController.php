<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Attraction;
use Inertia\Inertia;

class AboutController extends Controller
{
    /**
     * Show the about page
     */
    public function show()
    {
        $attractions = Attraction::where('status', 'active')->limit(3)->get();
        
        // Mock activity data
        $activities = collect([
            (object) [
                'id' => 1,
                'name' => 'Hiking Adventure',
                'description' => 'Explore scenic mountain trails',
            ],
            (object) [
                'id' => 2,
                'name' => 'Water Sports',
                'description' => 'Thrilling water activities for all ages',
            ],
            (object) [
                'id' => 3,
                'name' => 'Cultural Tour',
                'description' => 'Experience local traditions and heritage',
            ],
        ]);

        return Inertia::render('portal/about', [
            'attractions' => $attractions,
            'activities' => $activities,
        ]);
    }
}
