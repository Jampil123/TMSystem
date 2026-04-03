<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attraction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttractionController extends Controller
{
    /**
     * Get all attractions as JSON API
     */
    public function apiIndex()
    {
        try {
            $attractions = Attraction::all();
            
            return response()->json([
                'success' => true,
                'data' => $attractions->map(function ($attraction) {
                    return [
                        'id' => $attraction->id,
                        'name' => $attraction->name,
                        'location' => $attraction->location,
                        'category' => $attraction->category,
                        'image_url' => $attraction->image_url,
                    ];
                })->toArray(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching attractions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching attractions',
            ], 500);
        }
    }

    public function index()
    {
        $attractions = Attraction::all();
        
        return Inertia::render('admin/attractions/index', [
            'attractions' => $attractions,
            'stats' => [
                'total_attractions' => Attraction::count(),
                'active_attractions' => Attraction::where('status', 'active')->count(),
                'inactive_attractions' => Attraction::where('status', 'inactive')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'best_time_to_visit' => 'nullable|string',
            'location' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'entry_fee' => 'nullable|numeric',
            'image_url' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'status' => 'required|in:active,inactive',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        Attraction::create($validated);

        return redirect()->back()->with('success', 'Attraction created successfully');
    }

    public function update(Request $request, Attraction $attraction)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'best_time_to_visit' => 'nullable|string',
            'location' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'entry_fee' => 'nullable|numeric',
            'image_url' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'status' => 'required|in:active,inactive',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $attraction->update($validated);

        return redirect()->back()->with('success', 'Attraction updated successfully');
    }

    public function destroy(Attraction $attraction)
    {
        $attraction->delete();

        return redirect()->back()->with('success', 'Attraction deleted successfully');
    }
}
