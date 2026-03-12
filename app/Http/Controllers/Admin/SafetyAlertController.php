<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemAlert;
use App\Services\SafetyAlertEngine;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SafetyAlertController extends Controller
{
    protected SafetyAlertEngine $alertEngine;

    public function __construct(SafetyAlertEngine $alertEngine)
    {
        $this->alertEngine = $alertEngine;
    }

    /**
     * Get all active safety alerts
     */
    public function getActiveAlerts(): JsonResponse
    {
        $alerts = SystemAlert::unresolved()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => $alert->id,
                    'type' => $alert->alert_type,
                    'title' => $alert->title,
                    'message' => $alert->message,
                    'severity' => $alert->severity,
                    'target_role' => $alert->target_role,
                    'severity_color' => $alert->getSeverityColorClass(),
                    'type_icon' => $alert->getTypeIcon(),
                    'details' => $alert->details,
                    'created_at' => $alert->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $alerts,
            'count' => $alerts->count(),
        ]);
    }

    /**
     * Get alerts by type
     */
    public function getByType(Request $request): JsonResponse
    {
        $type = $request->query('type');
        
        if (!$type) {
            return response()->json([
                'success' => false,
                'error' => 'Alert type is required',
            ], 400);
        }

        $alerts = SystemAlert::byType($type)
            ->unresolved()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $alerts,
            'count' => $alerts->count(),
        ]);
    }

    /**
     * Get alerts by severity
     */
    public function getBySeverity(Request $request): JsonResponse
    {
        $severity = $request->query('severity');
        
        if (!$severity) {
            return response()->json([
                'success' => false,
                'error' => 'Severity is required',
            ], 400);
        }

        $alerts = SystemAlert::bySeverity($severity)
            ->unresolved()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $alerts,
            'count' => $alerts->count(),
        ]);
    }

    /**
     * Get recent alerts
     */
    public function getRecent(Request $request): JsonResponse
    {
        $limit = $request->query('limit', 10);
        
        $alerts = SystemAlert::recent($limit)
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => $alert->id,
                    'type' => $alert->alert_type,
                    'title' => $alert->title,
                    'message' => $alert->message,
                    'severity' => $alert->severity,
                    'is_resolved' => $alert->is_resolved,
                    'severity_color' => $alert->getSeverityColorClass(),
                    'type_icon' => $alert->getTypeIcon(),
                    'created_at' => $alert->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $alerts,
            'count' => $alerts->count(),
        ]);
    }

    /**
     * Mark alert as resolved
     */
    public function resolve(SystemAlert $alert): JsonResponse
    {
        if ($alert->is_resolved) {
            return response()->json([
                'success' => false,
                'error' => 'Alert is already resolved',
            ], 400);
        }

        $alert->markResolved();

        return response()->json([
            'success' => true,
            'message' => 'Alert resolved successfully',
            'data' => $alert,
        ]);
    }

    /**
     * Mark multiple alerts as resolved
     */
    public function resolveMultiple(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'alert_ids' => 'required|array',
            'alert_ids.*' => 'integer|exists:system_alerts,id',
        ]);

        $count = SystemAlert::whereIn('id', $validated['alert_ids'])
            ->where('is_resolved', false)
            ->update(['is_resolved' => true, 'resolved_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => "Resolved {$count} alert(s)",
            'resolved_count' => $count,
        ]);
    }

    /**
     * Run safety checks and generate alerts
     */
    public function runSafetyCheck(): JsonResponse
    {
        $this->alertEngine->checkAllConditions();

        return response()->json([
            'success' => true,
            'message' => 'Safety check completed',
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get safety dashboard summary
     */
    public function getSummary(): JsonResponse
    {
        $totalAlerts = SystemAlert::unresolved()->count();
        $criticalAlerts = SystemAlert::bySeverity('critical')->unresolved()->count();
        $highAlerts = SystemAlert::bySeverity('high')->unresolved()->count();
        $mediumAlerts = SystemAlert::bySeverity('medium')->unresolved()->count();
        $lowAlerts = SystemAlert::bySeverity('low')->unresolved()->count();

        $alertsByType = SystemAlert::unresolved()
            ->selectRaw('alert_type, COUNT(*) as count')
            ->groupBy('alert_type')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $totalAlerts,
                'by_severity' => [
                    'critical' => $criticalAlerts,
                    'high' => $highAlerts,
                    'medium' => $mediumAlerts,
                    'low' => $lowAlerts,
                ],
                'by_type' => $alertsByType->mapWithKeys(fn($item) => [$item->alert_type => $item->count]),
            ],
        ]);
    }

    /**
     * Check if there are critical safety issues
     */
    public function hasActiveCritical(): JsonResponse
    {
        $hasCritical = SystemAlert::bySeverity('critical')
            ->unresolved()
            ->exists();

        return response()->json([
            'success' => true,
            'has_critical' => $hasCritical,
            'count' => SystemAlert::bySeverity('critical')->unresolved()->count(),
        ]);
    }

    /**
     * Delete old resolved alerts (cleanup)
     */
    public function cleanup(Request $request): JsonResponse
    {
        $days = $request->query('days', 30);
        
        $deleted = SystemAlert::where('is_resolved', true)
            ->where('resolved_at', '<', now()->subDays($days))
            ->delete();

        return response()->json([
            'success' => true,
            'message' => "Deleted {$deleted} old resolved alert(s)",
            'count' => $deleted,
        ]);
    }
}
