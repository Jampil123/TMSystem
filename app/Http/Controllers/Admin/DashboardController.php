<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArrivalLog;
use App\Models\Attraction;
use App\Models\Guide;
use App\Models\GuideAssignment;
use App\Models\SystemAlert;
use App\Models\EmergencyLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function reportsPage()
    {
        $attractions = Attraction::query()
            ->where('status', 'active')
            ->select(['id', 'name', 'location', 'category'])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/reports', [
            'attractions' => $attractions,
        ]);
    }

    public function reportsApi(Request $request)
    {
        $attractionId = $request->integer('attraction_id');
        $baseQuery = DB::table('arrival_logs')
            ->join('guest_lists', 'arrival_logs.guest_list_id', '=', 'guest_lists.id')
            ->join('attractions', 'guest_lists.attraction_id', '=', 'attractions.id')
            ->where('arrival_logs.status', 'arrived');

        if ($attractionId) {
            $baseQuery->where('guest_lists.attraction_id', $attractionId);
        }

        $today = now()->toDateString();
        $weekStart = now()->startOfWeek()->toDateString();
        $weekEnd = now()->endOfWeek()->toDateString();

        $todaySummary = (clone $baseQuery)
            ->whereDate('arrival_logs.arrival_date', $today)
            ->selectRaw('
                COUNT(arrival_logs.log_id) as arrivals,
                COALESCE(SUM(guest_lists.total_guests), 0) as visitors,
                COALESCE(SUM(arrival_logs.fee_paid), 0) as revenue
            ')
            ->first();

        $weekSummary = (clone $baseQuery)
            ->whereBetween('arrival_logs.arrival_date', [$weekStart, $weekEnd])
            ->selectRaw('
                COALESCE(SUM(guest_lists.total_guests), 0) as visitors,
                COALESCE(SUM(arrival_logs.fee_paid), 0) as revenue
            ')
            ->first();

        $monthSummary = (clone $baseQuery)
            ->whereMonth('arrival_logs.arrival_date', now()->month)
            ->whereYear('arrival_logs.arrival_date', now()->year)
            ->selectRaw('
                COALESCE(SUM(guest_lists.total_guests), 0) as visitors,
                COALESCE(SUM(arrival_logs.fee_paid), 0) as revenue
            ')
            ->first();

        $byAttraction = (clone $baseQuery)
            ->selectRaw('
                attractions.id as attraction_id,
                attractions.name as attraction_name,
                COALESCE(SUM(guest_lists.total_guests), 0) as total_visitors,
                COALESCE(SUM(arrival_logs.fee_paid), 0) as total_revenue,
                COUNT(arrival_logs.log_id) as total_arrivals
            ')
            ->groupBy('attractions.id', 'attractions.name')
            ->orderByDesc('total_visitors')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'today_arrivals' => (int) ($todaySummary->arrivals ?? 0),
                    'today_visitors' => (int) ($todaySummary->visitors ?? 0),
                    'today_revenue' => (float) ($todaySummary->revenue ?? 0),
                    'week_visitors' => (int) ($weekSummary->visitors ?? 0),
                    'week_revenue' => (float) ($weekSummary->revenue ?? 0),
                    'month_visitors' => (int) ($monthSummary->visitors ?? 0),
                    'month_revenue' => (float) ($monthSummary->revenue ?? 0),
                ],
                'by_attraction' => $byAttraction,
            ],
        ]);
    }

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

        // Get today's total visitors (both arrived and departed, but not denied)
        $totalVisitorsToday = ArrivalLog::where('arrival_date', $today->toDateString())
            ->where('status', '!=', 'denied')
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

        // Get monthly revenue and total collection
        $monthlyRevenue = $this->getMonthlyRevenue();
        $totalCollection = $this->getTotalCollection();

        return [
            'totalVisitorsToday' => $totalVisitorsToday,
            'activeLocations' => count($locations),
            'deployedGuides' => $deployedGuides,
            'activeAlerts' => $alerts->count(),
            'locations' => $locations,
            'alerts' => $alerts,
            'monthlyRevenue' => $monthlyRevenue,
            'totalCollection' => $totalCollection,
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
     * Get monthly revenue from entrance fees
     */
    private function getMonthlyRevenue()
    {
        $currentYear = now()->year;
        
        // Get all 12 months of data
        $monthlyData = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthStart = \Carbon\Carbon::createFromDate($currentYear, $month, 1)->startOfMonth();
            $monthEnd = \Carbon\Carbon::createFromDate($currentYear, $month, 1)->endOfMonth();
            
            $monthName = $monthStart->format('M');
            
            // Count all fees except from 'denied' records (rejections)
            // Fees collected should remain regardless of arrival/departed status
            $revenue = ArrivalLog::whereBetween('arrival_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                ->where('status', '!=', 'denied')
                ->where('fee_paid', '>', 0)
                ->sum('fee_paid');
            
            $monthlyData[] = [
                'month' => $monthName,
                'revenue' => floatval($revenue),
            ];
        }
        
        return $monthlyData;
    }

    /**
     * Get total collection for today and all time
     * Counts fees from both 'arrived' and 'departed' statuses (non-refundable on departure)
     * Excludes 'denied' records (rejections with no fee collected)
     */
    private function getTotalCollection()
    {
        $today = now()->startOfDay();
        
        // Today's collection (arrived + departed, but NOT denied)
        $todayCollection = ArrivalLog::where('arrival_date', $today->toDateString())
            ->where('status', '!=', 'denied')
            ->where('fee_paid', '>', 0)
            ->sum('fee_paid');
        
        // All time collection (arrived + departed, but NOT denied)
        $allTimeCollection = ArrivalLog::where('status', '!=', 'denied')
            ->where('fee_paid', '>', 0)
            ->sum('fee_paid');
        
        return [
            'today' => floatval($todayCollection),
            'all_time' => floatval($allTimeCollection),
        ];
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
            ->where('status', '!=', 'denied')
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
