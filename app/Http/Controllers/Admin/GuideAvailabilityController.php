<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guide;
use App\Models\GuideAvailability;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuideAvailabilityController extends Controller
{
    /**
     * Display a listing of availabilities with filters.
     */
    public function index(Request $request)
    {
        $query = GuideAvailability::with('guide');

        if ($request->has('guide_id') && $request->guide_id) {
            $query->where('guide_id', $request->guide_id);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('date') && $request->date) {
            $date = $request->date;
            $query->whereDate('start_date', '<=', $date)
                  ->whereDate('end_date', '>=', $date);
        }

        $availabilities = $query->orderBy('start_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        $guides = Guide::select('id', 'full_name')->orderBy('full_name')->get();

        return Inertia::render('admin/guides/availability', [
            'availabilities' => $availabilities->map(function ($a) {
                return [
                    'id' => $a->id,
                    'guide' => [
                        'id' => $a->guide->id,
                        'name' => $a->guide->full_name,
                    ],
                    'start_date' => $a->start_date->toDateTimeString(),
                    'end_date' => $a->end_date->toDateTimeString(),
                    'full_day' => $a->full_day,
                    'status' => $a->status,
                    'notes' => $a->notes,
                ];
            })->all(),
            'guides' => $guides,
            'filters' => [
                'guide_id' => $request->guide_id ?? '',
                'status' => $request->status ?? 'all',
                'date' => $request->date ?? '',
            ],
            'pagination' => [
                'current_page' => $availabilities->currentPage(),
                'last_page' => $availabilities->lastPage(),
                'per_page' => $availabilities->perPage(),
                'total' => $availabilities->total(),
            ],
        ]);
    }

    /**
     * Store a new availability entry.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'guide_id' => 'required|exists:guides,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'full_day' => 'boolean',
            'status' => 'required|in:Available,Unavailable,On Leave',
            'notes' => 'nullable|string|max:1000',
        ]);

        // prevent overlapping availabilities for the same guide
        $overlap = GuideAvailability::where('guide_id', $validated['guide_id'])
            ->where(function ($q) use ($validated) {
                $q->whereBetween('start_date', [$validated['start_date'], $validated['end_date']])
                  ->orWhereBetween('end_date', [$validated['start_date'], $validated['end_date']]);
            })
            ->exists();

        if ($overlap) {
            return back()->withErrors(['start_date' => 'This availability overlaps with an existing entry.']);
        }

        GuideAvailability::create($validated);

        return redirect()->route('guides.availability')->with('success', 'Availability entry created.');
    }

    /**
     * Update an existing availability entry.
     */
    public function update(Request $request, GuideAvailability $availability)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'full_day' => 'boolean',
            'status' => 'required|in:Available,Unavailable,On Leave',
            'notes' => 'nullable|string|max:1000',
        ]);

        // check overlap excluding current record
        $overlap = GuideAvailability::where('guide_id', $availability->guide_id)
            ->where('id', '<>', $availability->id)
            ->where(function ($q) use ($validated) {
                $q->whereBetween('start_date', [$validated['start_date'], $validated['end_date']])
                  ->orWhereBetween('end_date', [$validated['start_date'], $validated['end_date']]);
            })
            ->exists();

        if ($overlap) {
            return back()->withErrors(['start_date' => 'This availability overlaps with an existing entry.']);
        }

        $availability->update($validated);

        return redirect()->route('guides.availability')->with('success', 'Availability updated.');
    }

    /**
     * Remove an availability entry.
     */
    public function destroy(GuideAvailability $availability)
    {
        $availability->delete();
        return redirect()->route('guides.availability')->with('success', 'Availability removed.');
    }
}
