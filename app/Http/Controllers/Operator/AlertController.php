<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\OperatorAlert;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlertController extends Controller
{
    /**
     * Display all alerts for the operator.
     */
    public function index()
    {
        $user = auth()->user();
        
        $alerts = OperatorAlert::where('operator_id', $user->id)
            ->orderByPriority()
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => $alert->id,
                    'alertType' => $alert->alert_type,
                    'priorityLevel' => $alert->priority_level,
                    'touristGroupName' => $alert->tourist_group_name,
                    'numberOfTourists' => $alert->number_of_tourists,
                    'assignedGuideName' => $alert->assigned_guide_name,
                    'activityServiceName' => $alert->activity_service_name,
                    'activityDateTime' => $alert->activity_date_time->format('M d, Y H:i'),
                    'description' => $alert->description,
                    'suggestedAction' => $alert->suggested_action,
                    'status' => $alert->status,
                    'resolutionNotes' => $alert->resolution_notes,
                    'createdAt' => $alert->created_at->format('M d, Y H:i'),
                ];
            });

        $activeCount = OperatorAlert::where('operator_id', $user->id)
            ->where('status', 'Active')
            ->count();

        $highPriorityCount = OperatorAlert::where('operator_id', $user->id)
            ->where('status', 'Active')
            ->where('priority_level', 'High')
            ->count();

        return Inertia::render('operator/alerts/index', [
            'alerts' => $alerts,
            'activeCount' => $activeCount,
            'highPriorityCount' => $highPriorityCount,
        ]);
    }

    /**
     * Get alerts as JSON (for API/dashboard).
     */
    public function getAlerts()
    {
        $user = auth()->user();
        
        $alerts = OperatorAlert::where('operator_id', $user->id)
            ->where('status', 'Active')
            ->orderByPriority()
            ->limit(10)
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => $alert->id,
                    'alertType' => $alert->alert_type,
                    'priorityLevel' => $alert->priority_level,
                    'touristGroupName' => $alert->tourist_group_name,
                    'numberOfTourists' => $alert->number_of_tourists,
                    'assignedGuideName' => $alert->assigned_guide_name,
                    'activityServiceName' => $alert->activity_service_name,
                    'activityDateTime' => $alert->activity_date_time->format('M d, Y H:i'),
                    'description' => $alert->description,
                    'suggestedAction' => $alert->suggested_action,
                    'status' => $alert->status,
                    'createdAt' => $alert->created_at->format('M d, Y H:i'),
                ];
            });

        return response()->json([
            'alerts' => $alerts,
            'total' => OperatorAlert::where('operator_id', $user->id)
                ->where('status', 'Active')
                ->count(),
        ]);
    }

    /**
     * Show a single alert.
     */
    public function show(OperatorAlert $alert)
    {
        $this->authorize('view', $alert);

        return Inertia::render('operator/alerts/show', [
            'alert' => [
                'id' => $alert->id,
                'alertType' => $alert->alert_type,
                'priorityLevel' => $alert->priority_level,
                'touristGroupName' => $alert->tourist_group_name,
                'numberOfTourists' => $alert->number_of_tourists,
                'assignedGuideName' => $alert->assigned_guide_name,
                'activityServiceName' => $alert->activity_service_name,
                'activityDateTime' => $alert->activity_date_time->format('M d, Y H:i'),
                'description' => $alert->description,
                'suggestedAction' => $alert->suggested_action,
                'status' => $alert->status,
                'resolutionNotes' => $alert->resolution_notes,
                'createdAt' => $alert->created_at->format('M d, Y H:i A'),
            ],
        ]);
    }

    /**
     * Acknowledge an alert.
     */
    public function acknowledge(Request $request, OperatorAlert $alert)
    {
        $this->authorize('update', $alert);
        
        $alert->acknowledge();

        return response()->json([
            'message' => 'Alert acknowledged successfully',
            'status' => $alert->status,
        ]);
    }

    /**
     * Resolve an alert.
     */
    public function resolve(Request $request, OperatorAlert $alert)
    {
        $this->authorize('update', $alert);

        $validated = $request->validate([
            'resolution_notes' => 'nullable|string|max:1000',
        ]);

        $alert->resolve($validated['resolution_notes'] ?? null);

        return response()->json([
            'message' => 'Alert resolved successfully',
            'status' => $alert->status,
        ]);
    }

    /**
     * Create a new alert (for testing/seeding).
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'alert_type' => 'required|in:Safety Issue,Guide Assignment,Schedule Conflict,Service Update',
            'priority_level' => 'required|in:High,Medium,Low',
            'tourist_group_name' => 'required|string',
            'number_of_tourists' => 'required|integer|min:1',
            'assigned_guide_name' => 'nullable|string',
            'activity_service_name' => 'required|string',
            'activity_date_time' => 'required|date_format:Y-m-d H:i',
            'description' => 'required|string',
            'suggested_action' => 'required|in:View,Resolve,Acknowledge',
        ]);

        $alert = OperatorAlert::create([
            'operator_id' => $user->id,
            ...$validated,
        ]);

        return response()->json([
            'message' => 'Alert created successfully',
            'alert' => $alert,
        ], 201);
    }
}
