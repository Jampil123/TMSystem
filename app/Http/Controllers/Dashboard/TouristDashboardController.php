<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Attraction;
use App\Models\Service;
use App\Models\User;
use Inertia\Inertia;

class TouristDashboardController extends Controller
{
    public function index()
    {
        // Get the first approved accommodation from database
        $accommodation = Service::where('service_type', 'Accommodation')
            ->where('status', 'Approved')
            ->with('accommodation', 'touristSpot')
            ->first();

        $featuredAccommodation = null;
        if ($accommodation) {
            $featuredAccommodation = [
                'id' => $accommodation->service_id,
                'title' => $accommodation->service_name,
                'description' => $accommodation->description ?? 'Discover our beautiful accommodation.',
                'location' => $accommodation->touristSpot?->location ?? 'Location not specified',
                'rating' => $accommodation->touristSpot?->rating ?? 0,
                'image' => $accommodation->touristSpot?->image_url ?? 'https://via.placeholder.com/600x400/375534/ffffff?text=Accommodation',
                'price' => '₱' . number_format($accommodation->accommodation?->price_per_night ?? 0, 2) . '/night',
                'guides' => [
                    ['id' => 1, 'name' => 'Room Type', 'role' => $accommodation->accommodation?->room_type ?? 'Standard'],
                ],
            ];
        } else {
            // Fallback mock data if no accommodations in database
            $featuredAccommodation = [
                'id' => 1,
                'title' => 'Badian Cove Beach Resort',
                'description' => 'Experience the ultimate tropical paradise at Badian Cove Beach Resort. Nestled along pristine white sandy beaches with crystal-clear turquoise waters.',
                'location' => 'Badian, Cebu',
                'rating' => 4.8,
                'image' => 'https://via.placeholder.com/600x400/375534/ffffff?text=Badian+Cove+Resort',
                'price' => '₱3,500/night',
                'guides' => [
                    ['id' => 1, 'name' => 'Room Type', 'role' => 'Deluxe Suite'],
                ],
            ];
        }

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

        return Inertia::render('dashboards/tourist-dashboard', [
            'featuredAccommodation' => $featuredAccommodation,
            'attractions' => $attractions,
            'operators' => $operators,
        ]);
    }
}
