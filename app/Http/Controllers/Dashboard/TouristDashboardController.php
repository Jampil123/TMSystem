<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Attraction;
use App\Models\User;
use Inertia\Inertia;

class TouristDashboardController extends Controller
{
    public function index()
    {
        // Mock accommodation data
        $accommodation = (object) [
            'id' => 1,
            'name' => 'Badian Cove Beach Resort',
            'description' => 'Experience the ultimate tropical paradise at Badian Cove Beach Resort. Nestled along pristine white sandy beaches with crystal-clear turquoise waters.',
            'location' => 'Badian, Cebu',
            'rating' => 4.8,
            'image_url' => 'https://via.placeholder.com/600x400/375534/ffffff?text=Badian+Cove+Resort',
        ];

        $attractions = Attraction::where('status', 'active')
            ->select('id', 'name', 'location', 'rating', 'entry_fee', 'image_url', 'latitude', 'longitude')
            ->limit(5)
            ->get()
            ->map(fn ($attraction) => [
                'id' => $attraction->id,
                'title' => $attraction->name,
                'location' => $attraction->location,
                'rating' => $attraction->rating ?? 0,
                'price' => '₱' . ($attraction->entry_fee ?? '0') . '/day',
                'image' => $attraction->image_url ?? 'https://via.placeholder.com/220x160/375534/ffffff?text=Attraction',
                'latitude' => $attraction->latitude ?? 9.4619,
                'longitude' => $attraction->longitude ?? 123.7473,
            ]);

        $operators = User::whereHas('role', fn ($query) => $query->where('name', 'External Operator'))
            ->select('id', 'name', 'email', 'username')
            ->limit(6)
            ->get()
            ->map(fn ($operator) => [
                'id' => $operator->id,
                'name' => $operator->name,
                'email' => $operator->email,
                'username' => $operator->username,
            ]);

        $featuredAccommodation = $accommodation ? [
            'id' => $accommodation->id,
            'title' => $accommodation->name,
            'description' => $accommodation->description ?? 'Discover our beautiful accommodation.',
            'location' => $accommodation->location ?? 'Location not specified',
            'rating' => $accommodation->rating ?? 0,
            'image' => $accommodation->image_url ?? 'https://via.placeholder.com/600x400/375534/ffffff?text=Accommodation',
            'guides' => [
                ['id' => 1, 'name' => 'Tour Guide', 'role' => '4.5 reviews'],
            ],
        ] : null;

        return Inertia::render('dashboards/tourist-dashboard', [
            'featuredAccommodation' => $featuredAccommodation,
            'attractions' => $attractions,
            'operators' => $operators,
        ]);
    }
}
