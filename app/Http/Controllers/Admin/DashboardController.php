<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArrivalLog;
use App\Models\Attraction;
use App\Models\Guide;
use App\Models\GuideAssignment;
use App\Models\SystemAlert;
use App\Models\EmergencyLog;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Show the LGU/DOT admin dashboard
     */
    public function index()
    {
        return Inertia::render('dashboards/lgu-dot-dashboard', [
            'initialData' => $this->getDashboardData(),
        ]);
    }

    /**
     * Get real-time dashboard data
     */
    public function getData()
    {
        return response()->json($this->getDashboardData());
    }

    /**
     * Compile all dashboard statistics and data
     */
    private function getDashboardData()
    {
        $today = now()->startOfDay();

        // Get today's total visitors
        $totalVisitorsToday = ArrivalLog::where('arrival_date', $today->toDateString())
            ->where('status', 'arrived')
            ->count();

        // Get active locations with current visitor count
        $locations = $this->getLocationMonitoringData();

        // Get deployed guides count
        $deployedGuides = GuideAssignment::whereDate('assignment_date', $today->toDateString())
            ->whereIn('assignment_status', ['Confirmed', 'Completed'])
            ->distinct('guide_id')
            ->count('guide_id');

        // Get current system alerts
        $alerts = SystemAlert::where('is_resolved', false)
            ->orderBy('severity', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($alert) => [
                'id' => $alert->id,
                'type' => $alert->alert_type,
                'message' => $alert->title,
                'severity' => $alert->severity,
                'created_at' => $alert->created_at,
            ]);

        // Count active attractions (those with visitors today)
        $activeLocations = ArrivalLog::where('arrival_date', $today->toDateString())
            ->distinct('guide_id')
            ->count('guide_id');

        return [
            'totalVisitorsToday' => $totalVisitorsToday,
            'activeLocations' => count($locations),
            'deployedGuides' => $deployedGuides,
            'activeAlerts' => $alerts->count(),
            'locations' => $locations,
            'alerts' => $alerts,
            'timestamp' => now(),
        ];
    }

    /**
     * Get location monitoring data with current visitor counts
     */
    private function getLocationMonitoringData()
    {
        $today = now()->startOfDay();

        // Get all attractions
        $attractions = Attraction::all();

        // Get total guides assigned today
        $totalAssignedGuides = GuideAssignment::where('assignment_date', $today->toDateString())
            ->distinct('guide_id')
            ->count('guide_id');

        // Get total arrivals today for visitor distribution
        $totalArrivals = ArrivalLog::where('arrival_date', $today->toDateString())
            ->where('status', 'arrived')
            ->count();

        return $attractions->map(function ($attraction, $index) use ($today, $totalAssignedGuides, $totalArrivals) {
            // Get actual guides assigned to this attraction
            $guidePerAttraction = GuideAssignment::where('assignment_date', $today->toDateString())
                ->whereIn('assignment_status', ['Confirmed', 'Completed'])
                ->distinct('guide_id')
                ->count('guide_id');

            // Get actual visitor count for this attraction
            // Count arrivals linked through guest lists to services at this attraction
            $currentVisitors = ArrivalLog::whereHas('guestList.service', function ($query) use ($attraction) {
                $query->where('tourist_spot_id', $attraction->id);
            })
                ->where('arrival_date', $today->toDateString())
                ->where('status', 'arrived')
                ->count();

            // Determine crowd level based on capacity
            $capacity = $attraction->capacity ?? 500;
            $crowdPercentage = $capacity > 0 ? ($currentVisitors / $capacity) * 100 : 0;

            if ($crowdPercentage >= 80) {
                $crowdLevel = 'High';
            } elseif ($crowdPercentage >= 50) {
                $crowdLevel = 'Medium';
            } else {
                $crowdLevel = 'Low';
            }

            return [
                'id' => $attraction->id,
                'name' => $attraction->name,
                'currentVisitors' => $currentVisitors,
                'capacity' => $capacity,
                'crowdLevel' => $crowdLevel,
                'guides' => $guidePerAttraction,
                'percentageCapacity' => round($crowdPercentage, 2),
            ];
        })->toArray();
    }

    /**
     * Get detailed alerts for viewing
     */
    public function getAlerts()
    {
        $alerts = SystemAlert::where('is_resolved', false)
            ->orderBy('severity', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($alerts);
    }

    /**
     * Get arrival statistics for a date range
     */
    public function getArrivalStats($startDate = null, $endDate = null)
    {
        $startDate = $startDate ? \Carbon\Carbon::parse($startDate) : now()->startOfMonth();
        $endDate = $endDate ? \Carbon\Carbon::parse($endDate) : now()->endOfMonth();

        $stats = ArrivalLog::whereBetween('arrival_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->where('status', 'arrived')
            ->groupBy('arrival_date')
            ->select(
                DB::raw('arrival_date as date'),
                DB::raw('COUNT(*) as count')
            )
            ->orderBy('arrival_date')
            ->get();

        return response()->json($stats);
    }

    /**
     * Get guide deployment statistics
     */
    public function getGuideStats()
    {
        $today = now()->startOfDay();

        $deployedGuides = GuideAssignment::whereDate('assignment_date', $today->toDateString())
            ->whereIn('assignment_status', ['Confirmed', 'Completed'])
            ->with('guide')
            ->get()
            ->groupBy('guide_id')
            ->map(function ($assignments) {
                $guide = $assignments->first()->guide;
                return [
                    'guide_id' => $guide->id,
                    'name' => $guide->full_name,
                    'assignments_count' => $assignments->count(),
                    'specialties' => $guide->specialty_areas ?? [],
                ];
            });

        return response()->json($deployedGuides->values());
    }

    /**
     * Get emergency logs for the dashboard
     */
    public function getEmergencyLogs()
    {
        $today = now()->startOfDay();

        $emergencies = EmergencyLog::whereDate('created_at', $today->toDateString())
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'type' => $log->emergency_type,
                'location' => $log->location,
                'severity' => $log->severity_level,
                'status' => $log->status,
                'created_at' => $log->created_at,
            ]);

        return response()->json($emergencies);
    }

    /**
     * Resolve an alert
     */
    public function resolveAlert($alertId)
    {
        $alert = SystemAlert::findOrFail($alertId);
        $alert->update([
            'is_resolved' => true,
            'resolved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Alert resolved successfully',
        ]);
    }
}
