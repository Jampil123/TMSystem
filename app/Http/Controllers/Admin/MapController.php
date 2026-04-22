<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attraction;
use App\Models\ArrivalLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MapController extends Controller
{
    /**
     * Get the current crowd count for each attraction based on today's arrival logs
     * joined through guest_list -> attraction.
     */
    private function getCrowdCounts(): array
    {
        return DB::table('arrival_logs')
            ->join('guest_lists', 'arrival_logs.guest_list_id', '=', 'guest_lists.id')
            ->select('guest_lists.attraction_id', DB::raw('COUNT(*) as crowd_count'))
            ->whereDate('arrival_logs.arrival_date', today())
            ->whereNotNull('guest_lists.attraction_id')
            ->groupBy('guest_lists.attraction_id')
            ->pluck('crowd_count', 'attraction_id')
            ->toArray();
    }

    /**
     * Display the attractions map
     */
    public function index()
    {
        $crowdCounts = $this->getCrowdCounts();

        $attractions = Attraction::all()->map(function ($attraction) use ($crowdCounts) {
            $latitude = $attraction->latitude ? (float) $attraction->latitude : 16.8409;
            $longitude = $attraction->longitude ? (float) $attraction->longitude : 121.7949;

            return [
                'id' => $attraction->id,
                'name' => $attraction->name,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'category' => $attraction->category ?? 'Uncategorized',
                'entry_fee' => $attraction->entry_fee,
                'crowd_count' => (int) ($crowdCounts[$attraction->id] ?? 0),
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
        $crowdCounts = $this->getCrowdCounts();

        $attractions = Attraction::all()->map(function ($attraction) use ($crowdCounts) {
            $latitude = $attraction->latitude ? (float) $attraction->latitude : 16.8409;
            $longitude = $attraction->longitude ? (float) $attraction->longitude : 121.7949;

            return [
                'id' => $attraction->id,
                'name' => $attraction->name,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'category' => $attraction->category ?? 'Uncategorized',
                'entry_fee' => $attraction->entry_fee,
                'crowd_count' => (int) ($crowdCounts[$attraction->id] ?? 0),
                'status' => $attraction->status ?? 'inactive',
                'description' => $attraction->description,
                'location' => $attraction->location,
                'image_url' => $attraction->image_url,
            ];
        })->toArray();

        return response()->json($attractions);
    }
}
