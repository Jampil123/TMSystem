<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Attraction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class ServiceController extends Controller
{
    /**
     * Display a listing of services for the operator.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        $services = Service::where('operator_id', $user->id)
            ->with(['touristSpot'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($service) {
                $mapped = [
                    'service_id' => $service->service_id,
                    'service_name' => $service->service_name,
                    'service_type' => $service->service_type,
                    'description' => $service->description,
                    'tourist_spot' => [
                        'attraction_name' => $service->touristSpot?->name ?? 'Unknown Attraction',
                    ],
                    'status' => $service->status,
                    'approved_at' => $service->approved_at,
                    'remarks' => $service->remarks,
                ];

                // Activity and accommodation details are no longer available
                // These relationships have been removed in recent updates
                // If needed in the future, these can be re-implemented

                return $mapped;
            });

        return Inertia::render('operator/services', [
            'services' => $services,
            'total' => $services->count(),
            'message' => $request->session()->get('success'),
        ]);
    }

    /**
     * Show the form for creating a new service.
     */
    public function create()
    {
        $attractions = Attraction::select('id', 'name')->get();
        
        $serviceTypes = [
            'adventure' => 'Adventure Activity',
            'tour' => 'Guided Tour',
            'accommodation' => 'Accommodation',
            'restaurant' => 'Restaurant/Food',
            'transport' => 'Transportation',
            'rental' => 'Equipment Rental',
            'other' => 'Other',
        ];

        return Inertia::render('operator/services/create', [
            'attractions' => $attractions,
            'serviceTypes' => $serviceTypes,
        ]);
    }

    /**
     * Store a newly created service in storage.
     */
    public function store(Request $request)
    {
        $serviceType = $request->input('service_type');

        // Base validation - always required
        $validated = $request->validate([
            'service_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('services', 'service_name')->where(fn ($q) => $q->where('operator_id', auth()->id())),
            ],
            'service_type' => 'required|string|in:adventure,tour,accommodation,restaurant,transport,rental,other',
            'tourist_spot_id' => 'required|exists:attractions,id',
            'description' => 'required|string|max:500',
            'facebook_url' => 'nullable|url',
            // Images: at least 1, JPG/PNG, max 5MB each
            'images' => ['required', 'array', 'min:1'],
            'images.*' => ['file', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        // Conditional validation based on service type
        if (in_array($serviceType, ['adventure', 'tour'])) {
            $request->validate([
                'activity_name' => 'required|string|max:255',
                'price_per_person' => 'required|numeric|min:0.01',
                'duration_minutes' => 'required|integer|min:1',
                'max_participants' => 'required|integer|min:1',
                'required_equipment' => 'nullable|string',
            ]);
        } elseif (in_array($serviceType, ['accommodation', 'restaurant'])) {
            $request->validate([
                'room_type' => 'required|string',
                'capacity' => 'required|integer|min:1',
                'price_per_night' => 'required|numeric|min:0.01',
                'total_rooms' => 'required|integer|min:1',
            ]);
        }

        // Create the main Service record
        $service = Service::create([
            'operator_id' => auth()->id(),
            'tourist_spot_id' => $validated['tourist_spot_id'],
            'service_type' => $validated['service_type'],
            'service_name' => $validated['service_name'],
            'description' => $validated['description'],
            'facebook_url' => $validated['facebook_url'] ?? null,
            'status' => 'pending',
        ]);

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('services/' . $service->service_id, 'public');
                // Store image path in database or handle as needed
                // You may want to create a ServiceImage model to store image paths
            }
        }

        // Create or handle related Activity or Accommodation record based on type
        if (in_array($serviceType, ['adventure', 'tour'])) {
            ActivityService::create([
                'service_id' => $service->service_id,
                'activity_name' => $request->input('activity_name'),
                'price_per_person' => (float) $request->input('price_per_person'),
                'duration_minutes' => (int) $request->input('duration_minutes'),
                'max_participants' => (int) $request->input('max_participants'),
                'required_equipment' => $request->input('required_equipment'),
            ]);
        } elseif (in_array($serviceType, ['accommodation', 'restaurant'])) {
            AccommodationService::create([
                'service_id' => $service->service_id,
                'room_type' => $request->input('room_type'),
                'capacity' => (int) $request->input('capacity'),
                'price_per_night' => (float) $request->input('price_per_night'),
                'total_rooms' => (int) $request->input('total_rooms'),
            ]);
        }

        return redirect()->route('operator.services.index')
            ->with('success', 'Service created successfully! It will be reviewed by our team.');
    }

    /**
     * Display the specified service.
     */
    public function show(Service $service)
    {
        // Check if the user owns this service
        if ($service->operator_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('operator/services/show', [
            'service' => $service->with('touristSpot')->first(),
        ]);
    }

    /**
     * Show the form for editing the specified service.
     */
    public function edit(Service $service)
    {
        // Check if the user owns this service
        if ($service->operator_id !== auth()->id()) {
            abort(403);
        }

        $service->load(['activity', 'accommodation']);

        $attractions = Attraction::select('id', 'name')->get();
        
        $serviceTypes = [
            'adventure' => 'Adventure Activity',
            'tour' => 'Guided Tour',
            'accommodation' => 'Accommodation',
            'restaurant' => 'Restaurant/Food',
            'transport' => 'Transportation',
            'rental' => 'Equipment Rental',
            'other' => 'Other',
        ];

        return Inertia::render('operator/services/edit', [
            'service' => $service,
            'attractions' => $attractions,
            'serviceTypes' => $serviceTypes,
        ]);
    }

    /**
     * Update the specified service in storage.
     */
    public function update(Request $request, Service $service)
    {
        // Check if the user owns this service
        if ($service->operator_id !== auth()->id()) {
            abort(403);
        }

        $serviceType = $request->input('service_type');

        // Base validation - always required
        $validated = $request->validate([
            'service_name' => 'required|string|max:255',
            'service_type' => 'required|string|in:adventure,tour,accommodation,restaurant,transport,rental,other',
            'tourist_spot_id' => 'required|exists:attractions,id',
            'description' => 'required|string|max:500',
            'facebook_url' => 'nullable|url',
        ]);

        // Conditional validation based on service type
        if (in_array($serviceType, ['adventure', 'tour'])) {
            $request->validate([
                'activity_name' => 'required|string|max:255',
                'price_per_person' => 'required|numeric|min:0.01',
                'duration_minutes' => 'required|integer|min:1',
                'max_participants' => 'required|integer|min:1',
                'required_equipment' => 'nullable|string',
            ]);
        } elseif (in_array($serviceType, ['accommodation', 'restaurant'])) {
            $request->validate([
                'room_type' => 'required|string',
                'capacity' => 'required|integer|min:1',
                'price_per_night' => 'required|numeric|min:0.01',
                'total_rooms' => 'required|integer|min:1',
            ]);
        }

        // Update the main Service record
        $service->update([
            'tourist_spot_id' => $validated['tourist_spot_id'],
            'service_type' => $validated['service_type'],
            'service_name' => $validated['service_name'],
            'description' => $validated['description'],
            'facebook_url' => $validated['facebook_url'] ?? null,
        ]);

        // Update or create related Activity or Accommodation record based on type
        if (in_array($serviceType, ['adventure', 'tour'])) {
            // Delete accommodation if it exists
            if ($service->accommodation) {
                $service->accommodation->delete();
            }
            // Create or update activity
            ActivityService::updateOrCreate(
                ['service_id' => $service->service_id],
                [
                    'activity_name' => $request->input('activity_name'),
                    'price_per_person' => (float) $request->input('price_per_person'),
                    'duration_minutes' => (int) $request->input('duration_minutes'),
                    'max_participants' => (int) $request->input('max_participants'),
                    'required_equipment' => $request->input('required_equipment'),
                ]
            );
        } elseif (in_array($serviceType, ['accommodation', 'restaurant'])) {
            // Delete activity if it exists
            if ($service->activity) {
                $service->activity->delete();
            }
            // Create or update accommodation
            AccommodationService::updateOrCreate(
                ['service_id' => $service->service_id],
                [
                    'room_type' => $request->input('room_type'),
                    'capacity' => (int) $request->input('capacity'),
                    'price_per_night' => (float) $request->input('price_per_night'),
                    'total_rooms' => (int) $request->input('total_rooms'),
                ]
            );
        }

        return redirect()->route('operator.services.index')
            ->with('success', 'Service updated successfully!');
    }

    /**
     * Remove the specified service from storage.
     */
    public function destroy(Service $service)
    {
        // Check if the user owns this service
        if ($service->operator_id !== auth()->id()) {
            abort(403);
        }

        $service->delete();

        return redirect()->route('operator.services.index')
            ->with('success', 'Service deleted successfully!');
    }

    /**
     * Display service requests for the operator.
     */
    public function requests()
    {
        $user = auth()->user();

        // Fetch service requests related to operator's services
        // This is placeholder logic - adjust based on your actual structure
        $requests = [];

        return Inertia::render('operator/services/requests', [
            'requests' => $requests,
            'totalPending' => 0,
        ]);
    }
}
