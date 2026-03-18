<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Attraction;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $attractions = Attraction::where('status', 'active')->get();
        
        // Mock activity data
        $activities = collect([
            (object) [
                'id' => 1,
                'name' => 'Island Hopping Adventure',
                'description' => 'Explore the beautiful islands around Badian',
                'image_url' => 'https://via.placeholder.com/300x200/375534/ffffff?text=Island+Hopping',
            ],
            (object) [
                'id' => 2,
                'name' => 'Snorkeling Experience',
                'description' => 'Discover vibrant coral reefs and marine life',
                'image_url' => 'https://via.placeholder.com/300x200/375534/ffffff?text=Snorkeling',
            ],
        ]);
        
        // Mock accommodation data
        $accommodations = collect([
            (object) [
                'id' => 1,
                'name' => 'Badian Cove Beach Resort',
                'description' => 'Luxury beachfront resort with stunning oceanviews',
                'image_url' => 'https://via.placeholder.com/300x200/375534/ffffff?text=Beach+Resort',
            ],
            (object) [
                'id' => 2,
                'name' => 'Mountain View Lodge',
                'description' => 'Cozy mountain retreat with panoramic views',
                'image_url' => 'https://via.placeholder.com/300x200/375534/ffffff?text=Mountain+Lodge',
            ],
        ]);

        return Inertia::render('portal/home', [
            'attractions' => $attractions,
            'activities' => $activities,
            'accommodations' => $accommodations,
        ]);
    }
}
