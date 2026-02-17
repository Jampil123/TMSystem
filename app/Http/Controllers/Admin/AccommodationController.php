<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccommodationController extends Controller
{
    public function index()
    {
        $accommodations = Accommodation::all();
        
        return Inertia::render('admin/accommodations/index', [
            'accommodations' => $accommodations,
            'stats' => [
                'total_accommodations' => Accommodation::count(),
                'active_accommodations' => Accommodation::where('status', 'active')->count(),
                'inactive_accommodations' => Accommodation::where('status', 'inactive')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string|max:100',
            'location' => 'required|string|max:255',
            'image_url' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'status' => 'required|in:active,inactive',
        ]);

        Accommodation::create($validated);

        return redirect()->back()->with('success', 'Accommodation created successfully');
    }

    public function update(Request $request, Accommodation $accommodation)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string|max:100',
            'location' => 'required|string|max:255',
            'image_url' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'status' => 'required|in:active,inactive',
        ]);

        $accommodation->update($validated);

        return redirect()->back()->with('success', 'Accommodation updated successfully');
    }

    public function destroy(Accommodation $accommodation)
    {
        $accommodation->delete();

        return redirect()->back()->with('success', 'Accommodation deleted successfully');
    }
}
