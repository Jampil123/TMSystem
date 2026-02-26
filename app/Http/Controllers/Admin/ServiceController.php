<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Notifications\ServiceApprovedNotification;
use App\Notifications\ServiceRejectedNotification;
use App\Notifications\ServiceRevisionRequestedNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    /**
     * Display a listing of all services.
     */
    public function index(Request $request)
    {
        $query = Service::with(['operator', 'touristSpot', 'activity', 'accommodation', 'approvedByAdmin']);

        // Filter by status if provided
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by service type if provided
        if ($request->has('service_type') && $request->service_type !== '') {
            $query->where('service_type', $request->service_type);
        }

        // Filter by operator if provided
        if ($request->has('operator_id') && $request->operator_id !== '') {
            $query->where('operator_id', $request->operator_id);
        }

        // Search by service name if provided
        if ($request->has('search') && $request->search !== '') {
            $query->where('service_name', 'like', '%' . $request->search . '%');
        }

        $services = $query->orderBy('created_at', 'desc')->paginate(15);

        // Transform the data while preserving pagination
        $services->setCollection(
            $services->getCollection()->map(function ($service) {
                return $this->transformService($service);
            })
        );

        return Inertia::render('admin/services/index', [
            'services' => $services,
            'filters' => [
                'status' => $request->status,
                'service_type' => $request->service_type,
                'operator_id' => $request->operator_id,
                'search' => $request->search,
            ],
            'statuses' => ['Pending', 'Approved', 'Rejected', 'Revision Required'],
            'serviceTypes' => ['adventure', 'tour', 'accommodation', 'restaurant', 'transport', 'rental', 'other'],
        ]);
    }

    /**
     * Display pending services only.
     */
    public function pending(Request $request)
    {
        $query = Service::where('status', 'Pending')
            ->with(['operator', 'touristSpot', 'activity', 'accommodation', 'approvedByAdmin']);

        // Search by service name if provided
        if ($request->has('search') && $request->search !== '') {
            $query->where('service_name', 'like', '%' . $request->search . '%');
        }

        $services = $query->orderBy('created_at', 'asc')->paginate(15);

        // Transform the data while preserving pagination
        $services->setCollection(
            $services->getCollection()->map(function ($service) {
                return $this->transformService($service);
            })
        );

        return Inertia::render('admin/services/pending', [
            'services' => $services,
            'totalPending' => Service::where('status', 'Pending')->count(),
        ]);
    }

    /**
     * Display approved services only.
     */
    public function approved(Request $request)
    {
        $query = Service::where('status', 'Approved')
            ->with(['operator', 'touristSpot', 'activity', 'accommodation', 'approvedByAdmin']);

        // Search by service name if provided
        if ($request->has('search') && $request->search !== '') {
            $query->where('service_name', 'like', '%' . $request->search . '%');
        }

        $services = $query->orderBy('created_at', 'desc')->paginate(15);

        // Transform the data while preserving pagination
        $services->setCollection(
            $services->getCollection()->map(function ($service) {
                return $this->transformService($service);
            })
        );

        return Inertia::render('admin/services/approved', [
            'services' => $services,
            'totalApproved' => Service::where('status', 'Approved')->count(),
        ]);
    }

    /**
     * Display the specified service details.
     */
    public function show(Service $service)
    {
        $service->load(['operator', 'touristSpot', 'activity', 'accommodation', 'approvedByAdmin']);

        // Get standard pricing if available (you may want to define this based on service type)
        $standardPrice = $this->getStandardPrice($service);

        return Inertia::render('admin/services/show', [
            'service' => $this->transformService($service),
            'standardPrice' => $standardPrice,
            'priceComparison' => $this->comparePricing($service, $standardPrice),
        ]);
    }

    /**
     * Approve the specified service.
     */
    public function approve(Request $request, Service $service)
    {
        $validated = $request->validate([
            'remarks' => 'nullable|string|max:500',
        ]);

        $service->approve(auth()->id(), $validated['remarks'] ?? null);

        // Send notification to operator
        $service->operator->notify(new ServiceApprovedNotification($service, $validated['remarks'] ?? ''));

        return redirect()->back()->with('success', 'Service approved successfully');
    }

    /**
     * Reject the specified service.
     */
    public function reject(Request $request, Service $service)
    {
        $validated = $request->validate([
            'remarks' => 'required|string|max:500',
        ]);

        $service->reject(auth()->id(), $validated['remarks']);

        // Send notification to operator
        $service->operator->notify(new ServiceRejectedNotification($service, $validated['remarks']));

        return redirect()->back()->with('success', 'Service rejected successfully');
    }

    /**
     * Request revision on the specified service.
     */
    public function requestRevision(Request $request, Service $service)
    {
        $validated = $request->validate([
            'remarks' => 'required|string|max:500',
        ]);

        $service->requestRevision(auth()->id(), $validated['remarks']);

        // Send notification to operator
        $service->operator->notify(new ServiceRevisionRequestedNotification($service, $validated['remarks']));

        return redirect()->back()->with('success', 'Revision request sent to operator');
    }

    /**
     * Transform service data for display.
     */
    private function transformService(Service $service): array
    {
        $mapped = [
            'service_id' => $service->service_id,
            'service_name' => $service->service_name,
            'service_type' => $service->service_type,
            'status' => $service->status,
            'operator' => [
                'id' => $service->operator?->id,
                'name' => $service->operator?->name,
                'email' => $service->operator?->email,
            ],
            'tourist_spot' => [
                'id' => $service->touristSpot?->id,
                'name' => $service->touristSpot?->name,
            ],
            'description' => $service->description,
            'facebook_url' => $service->facebook_url,
            'approved_at' => $service->approved_at,
            'created_at' => $service->created_at,
            'remarks' => $service->remarks,
            'approved_by_admin' => $service->approvedByAdmin ? [
                'id' => $service->approvedByAdmin->id,
                'name' => $service->approvedByAdmin->name,
            ] : null,
        ];

        // Include activity details if it exists
        if ($service->activity) {
            $mapped['activity'] = [
                'activity_name' => $service->activity->activity_name,
                'price_per_person' => $service->activity->price_per_person,
                'duration_minutes' => $service->activity->duration_minutes,
                'max_participants' => $service->activity->max_participants,
                'required_equipment' => $service->activity->required_equipment,
            ];
        }

        // Include accommodation details if it exists
        if ($service->accommodation) {
            $mapped['accommodation'] = [
                'room_type' => $service->accommodation->room_type,
                'capacity' => $service->accommodation->capacity,
                'price_per_night' => $service->accommodation->price_per_night,
                'total_rooms' => $service->accommodation->total_rooms,
            ];
        }

        return $mapped;
    }

    /**
     * Get standard pricing for comparison (can be customized per service type).
     */
    private function getStandardPrice(Service $service): ?array
    {
        // Define standard pricing based on service type
        // This can be expanded to use a database table
        $standardPrices = [
            'adventure' => ['min' => 500, 'max' => 5000, 'avg' => 2500],
            'tour' => ['min' => 1000, 'max' => 3000, 'avg' => 1500],
            'accommodation' => ['min' => 500, 'max' => 3000, 'avg' => 1500],
            'restaurant' => ['min' => 300, 'max' => 2000, 'avg' => 1000],
        ];

        return $standardPrices[$service->service_type] ?? null;
    }

    /**
     * Compare current pricing with standard pricing.
     */
    private function comparePricing(Service $service, ?array $standardPrice): ?array
    {
        if (!$standardPrice) {
            return null;
        }

        $currentPrice = null;
        $priceType = null;

        if ($service->activity) {
            $currentPrice = $service->activity->price_per_person;
            $priceType = 'per_person';
        } elseif ($service->accommodation) {
            $currentPrice = $service->accommodation->price_per_night;
            $priceType = 'per_night';
        }

        if (!$currentPrice) {
            return null;
        }

        $avgPrice = $standardPrice['avg'];
        $percentageDeviation = (($currentPrice - $avgPrice) / $avgPrice) * 100;
        $status = 'normal';

        if ($percentageDeviation > 30) {
            $status = 'high';
        } elseif ($percentageDeviation < -30) {
            $status = 'low';
        }

        return [
            'current_price' => $currentPrice,
            'standard_avg' => $avgPrice,
            'standard_min' => $standardPrice['min'],
            'standard_max' => $standardPrice['max'],
            'percentage_deviation' => round($percentageDeviation, 2),
            'price_type' => $priceType,
            'status' => $status,
        ];
    }
}
