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
                'image_url' => 'storage/images/island.jpg',
            ],
            (object) [
                'id' => 2,
                'name' => 'Snorkeling Experience',
                'description' => 'Discover vibrant coral reefs and marine life',
                'image_url' => 'storage/images/snorkel.jpg',
            ],
            (object) [
                'id' => 3,
                'name' => 'Hiking to Osmena Peak',
                'description' => 'Reach the highest peak in Cebu for breathtaking views',
                'image_url' => 'storage/images/hiking.jpg',
            ],
        ]);
        
        // Mock accommodation data
        $accommodations = collect([
            (object) [
                'id' => 1,
                'name' => 'Badian Island Resort',
                'description' => 'Luxury beachfront resort with stunning oceanviews',
                'image_url' => 'storage/images/pool.jpg',
                'facebook_url' => 'https://www.facebook.com/BadianIsla',
            ],
            (object) [
                'id' => 2,
                'name' => 'Tuyom',
                'description' => 'Serene lodge nestled in nature with cozy accommodations',
                'image_url' => 'storage/images/tuyom.jpg',
                'facebook_url' => 'https://www.facebook.com/tuyombyhostelseven',
            ],
            (object) [
                'id' => 3,
                'name' => 'Marikan Beach Resort',
                'description' => 'Charming beachfront resort with a relaxing atmosphere',
                'image_url' => 'storage/images/marika.jpg',
                'facebook_url' => 'https://www.facebook.com/marikaresort',
            ],
            (object) [
                'id' => 4,
                'name' => 'Casa De Amor Lambug',
                'description' => 'Budget-friendly accommodation with a cozy ambiance',
                'image_url' => 'storage/images/casa.jpg',
                'facebook_url' => 'https://www.facebook.com/profile.php?id=61565242933257',
            ],
        ]);

        return Inertia::render('portal/home', [
            'attractions' => $attractions,
            'activities' => $activities,
            'accommodations' => $accommodations,
        ]);
    }
}
