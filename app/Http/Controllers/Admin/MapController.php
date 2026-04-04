<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attraction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MapController extends Controller
{
    /**
     * Display the attractions map
     */
    public function index()
    {
        $attractions = Attraction::all()->map(function ($attraction) {
            $latitude = $attraction->latitude ? (float) $attraction->latitude : 16.8409;
            $longitude = $attraction->longitude ? (float) $attraction->longitude : 121.7949;
            
            return [
                'id' => $attraction->id,
                'name' => $attraction->name,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'category' => $attraction->category ?? 'Uncategorized',
                'entry_fee' => $attraction->entry_fee,
                'rating' => $attraction->rating ?? 0,
                'status' => $attraction->status ?? 'inactive',
                'description' => $attraction->description,
                'location' => $attraction->location,
                'image_url' => $attraction->image_url,
            ];
        })->toArray();

        // Calculate stats
        $stats = [
            'total' => count($attractions),
            'active' => count(array_filter($attractions, fn($a) => $a['status'] === 'active')),
            'inactive' => count(array_filter($attractions, fn($a) => $a['status'] === 'inactive')),
        ];

        return Inertia::render('admin/map', [
            'attractions' => $attractions,
            'stats' => $stats,
        ]);
    }

    /**
     * Get attractions as JSON API (for real-time updates)
     */
    public function api()
    {
        $attractions = Attraction::all()->map(function ($attraction) {
            $latitude = $attraction->latitude ? (float) $attraction->latitude : 16.8409;
            $longitude = $attraction->longitude ? (float) $attraction->longitude : 121.7949;
            
            return [
                'id' => $attraction->id,
                'name' => $attraction->name,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'category' => $attraction->category ?? 'Uncategorized',
                'entry_fee' => $attraction->entry_fee,
                'rating' => $attraction->rating ?? 0,
                'status' => $attraction->status ?? 'inactive',
                'description' => $attraction->description,
                'location' => $attraction->location,
                'image_url' => $attraction->image_url,
            ];
        })->toArray();

        return response()->json($attractions);
    }
}
