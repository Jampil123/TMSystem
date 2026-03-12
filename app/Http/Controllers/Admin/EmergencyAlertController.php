<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmergencyLog;
use App\Services\EmergencyAlertService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class EmergencyAlertController extends Controller
{
    protected EmergencyAlertService $emergencyService;

    public function __construct(EmergencyAlertService $emergencyService)
    {
        $this->emergencyService = $emergencyService;
    }

    /**
     * Get all active emergency alerts
     */
    public function getActive(): JsonResponse
    {
        $emergencies = EmergencyLog::active()
            ->with('triggeredBy')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($emergency) {
                return [
                    'id' => $emergency->id,
                    'type' => $emergency->emergency_type,
                    'severity' => $emergency->severity,
                    'title' => $emergency->title,
                    'description' => $emergency->description,
                    'details' => $emergency->details,
                    'triggered_by' => $emergency->triggeredBy?->name,
                    'created_at' => $emergency->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $emergencies,
            'count' => $emergencies->count(),
        ]);
    }

    /**
     * Get emergency dashboard status
     */
    public function getStatus(): JsonResponse
    {
        $status = $this->emergencyService->getEmergencyStatus();

        return response()->json([
            'success' => true,
            'data' => $status,
        ]);
    }

    /**
     * Get emergency history/logs
     */
    public function getHistory(Request $request): JsonResponse
    {
        $limit = $request->query('limit', 50);
        $type = $request->query('type');

        $query = EmergencyLog::with('triggeredBy', 'resolvedBy')
            ->orderBy('created_at', 'desc');

        if ($type) {
            $query->byType($type);
        }

        $emergencies = $query->limit($limit)
            ->get()
            ->map(function ($emergency) {
                return [
                    'id' => $emergency->id,
                    'type' => $emergency->emergency_type,
                    'severity' => $emergency->severity,
                    'title' => $emergency->title,
                    'description' => $emergency->description,
                    'is_active' => $emergency->is_active,
                    'triggered_by' => $emergency->triggeredBy?->name,
                    'resolved_by' => $emergency->resolvedBy?->name,
                    'created_at' => $emergency->created_at->toIso8601String(),
                    'resolved_at' => $emergency->resolved_at?->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $emergencies,
            'count' => $emergencies->count(),
        ]);
    }

    /**
     * Resolve an emergency alert
     */
    public function resolve(EmergencyLog $emergency, Request $request): JsonResponse
    {
        if (!$emergency->is_active) {
            return response()->json([
                'success' => false,
                'error' => 'Emergency alert is already resolved',
            ], 400);
        }

        $validated = $request->validate([
            'resolution_notes' => 'nullable|string|max:500',
        ]);

        $this->emergencyService->resolveEmergency(
            $emergency,
            Auth::user(),
            $validated['resolution_notes'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Emergency alert resolved',
            'data' => $emergency,
        ]);
    }

    /**
     * Trigger a manual emergency alert
     */
    public function trigger(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'details' => 'nullable|array',
        ]);

        $emergency = $this->emergencyService->triggerManualEmergency(
            Auth::user(),
            $validated['title'],
            $validated['description'],
            $validated['details'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Manual emergency alert triggered',
            'data' => $emergency,
        ]);
    }

    /**
     * Check if entry should be blocked
     */
    public function checkEntryBlock(): JsonResponse
    {
        $shouldBlock = $this->emergencyService->shouldBlockNewEntry();
        $activeEmergencies = EmergencyLog::active()->get();

        return response()->json([
            'success' => true,
            'should_block' => $shouldBlock,
            'active_emergencies' => $activeEmergencies,
            'reason' => $shouldBlock ? 'Emergency condition detected - entry temporarily blocked' : null,
        ]);
    }

    /**
     * Check specific emergency condition
     */
    public function checkCondition(Request $request): JsonResponse
    {
        $condition = $request->query('type');

        $result = match($condition) {
            'capacity' => $this->emergencyService->checkCapacityEmergency(),
            'density' => $this->emergencyService->checkUnsafeDensityEmergency(),
            default => null,
        };

        return response()->json([
            'success' => true,
            'condition' => $condition,
            'triggered' => $result !== null,
            'emergency' => $result,
        ]);
    }

    /**
     * Get entry block status for entrance staff
     */
    public function getEntryBlockStatus(): JsonResponse
    {
        $shouldBlock = $this->emergencyService->shouldBlockNewEntry();
        $activeEmergencies = EmergencyLog::active()
            ->get()
            ->map(function ($emergency) {
                return [
                    'id' => $emergency->id,
                    'type' => $emergency->emergency_type,
                    'title' => $emergency->title,
                    'description' => $emergency->description,
                ];
            });

        return response()->json([
            'success' => true,
            'blocks_entry' => $shouldBlock,
            'active_emergencies' => $activeEmergencies,
        ]);
    }
}
