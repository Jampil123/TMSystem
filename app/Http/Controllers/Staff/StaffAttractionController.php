<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Attraction;
use App\Models\CapacityRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StaffAttractionController extends Controller
{
    /**
     * Show the attraction selection page for the entrance staff.
     */
    public function selectAttraction()
    {
        $attractions = Attraction::where('status', 'active')
            ->select('id', 'name', 'location', 'category', 'image_url')
            ->orderBy('name')
            ->get();

        return Inertia::render('staff/select-attraction', [
            'attractions' => $attractions,
        ]);
    }

    /**
     * Store the selected attraction in the session and redirect to the dashboard.
     */
    public function storeSelectedAttraction(Request $request)
    {
        $request->validate([
            'attraction_id' => ['required', 'integer', 'exists:attractions,id'],
        ]);

        $request->session()->put('staff_attraction_id', $request->attraction_id);

        return redirect()->route('staff.dashboard');
    }

    /**
     * Resolve the session attraction and its capacity rule.
     * Redirects to selection page if no attraction is chosen yet.
     */
    private function resolveAttractionProps(Request $request): array|null
    {
        $attractionId = $request->session()->get('staff_attraction_id');

        if (!$attractionId) {
            return null;
        }

        $attraction = Attraction::find($attractionId);
        if (!$attraction) {
            return null;
        }

        $rule = CapacityRule::where('attraction_id', $attractionId)->first()
            ?? CapacityRule::whereNull('attraction_id')->first();

        $capacityRule = $rule ? [
            'max_visitors'              => $rule->max_visitors,
            'warning_threshold_percent' => $rule->warning_threshold_percent,
            'critical_threshold_percent'=> $rule->critical_threshold_percent,
            'max_guests_per_guide'      => $rule->max_guests_per_guide,
            'max_daily_visitors'        => $rule->max_daily_visitors,
        ] : [
            'max_visitors'              => 350,
            'warning_threshold_percent' => 80,
            'critical_threshold_percent'=> 100,
            'max_guests_per_guide'      => 20,
            'max_daily_visitors'        => 500,
        ];

        return [
            'attraction' => [
                'id'       => $attraction->id,
                'name'     => $attraction->name,
                'location' => $attraction->location,
                'category' => $attraction->category,
            ],
            'capacityRule' => $capacityRule,
        ];
    }

    /**
     * Show the staff dashboard with the selected attraction and its capacity rule.
     */
    public function dashboard(Request $request)
    {
        $props = $this->resolveAttractionProps($request);

        if (!$props) {
            return redirect()->route('staff.select-attraction');
        }

        return Inertia::render('dashboards/staff-dashboard', $props);
    }

    /**
     * Show the arrivals page with the selected attraction and its capacity rule.
     */
    public function arrivals(Request $request)
    {
        $props = $this->resolveAttractionProps($request);

        if (!$props) {
            return redirect()->route('staff.select-attraction');
        }

        return Inertia::render('staff/arrivals', $props);
    }

    /**
     * Show the visitor counter page with the selected attraction and its capacity rule.
     */
    public function visitorCounter(Request $request)
    {
        $props = $this->resolveAttractionProps($request);

        if (!$props) {
            return redirect()->route('staff.select-attraction');
        }

        return Inertia::render('staff/visitor-counter', $props);
    }

    /**
     * Show the reports page with the selected attraction and its capacity rule.
     */
    public function reportsPage(Request $request)
    {
        $props = $this->resolveAttractionProps($request);

        if (!$props) {
            return redirect()->route('staff.select-attraction');
        }

        return Inertia::render('staff/reports', $props);
    }

    /**
     * Reports analytics API — revenue + visitor stats for the selected attraction.
     */
    public function reportsApi(Request $request)
    {
        $attractionId = $request->session()->get('staff_attraction_id');

        if (!$attractionId) {
            return response()->json(['success' => false, 'message' => 'No attraction selected.'], 422);
        }

        $attraction = Attraction::find($attractionId);
        if (!$attraction) {
            return response()->json(['success' => false, 'message' => 'Attraction not found.'], 404);
        }

        $entryFee = (float) ($attraction->entry_fee ?? 0);

        // ── Helpers ──────────────────────────────────────────────────────────────
        // arrival_logs row → guest count from linked guest_list
        // Revenue = guest_list.total_guests * attraction.entry_fee

        // ── Today ────────────────────────────────────────────────────────────────
        $todayStats = DB::table('arrival_logs')
            ->join('guest_lists', 'arrival_logs.guest_list_id', '=', 'guest_lists.id')
            ->where('guest_lists.attraction_id', $attractionId)
            ->whereDate('arrival_logs.arrival_date', today())
            ->where('arrival_logs.status', 'arrived')
            ->selectRaw('
                COUNT(arrival_logs.log_id) as total_arrivals,
                COALESCE(SUM(guest_lists.total_guests), 0) as total_guests,
                COALESCE(SUM(guest_lists.local_tourists), 0) as local_tourists,
                COALESCE(SUM(guest_lists.foreign_tourists), 0) as foreign_tourists
            ')
            ->first();

        $todayRevenue   = ($todayStats->total_guests ?? 0) * $entryFee;
        $todayVisitors  = (int) ($todayStats->total_guests ?? 0);
        $todayArrivals  = (int) ($todayStats->total_arrivals ?? 0);

        // ── This week (Mon–Sun) ───────────────────────────────────────────────────
        $weekStats = DB::table('arrival_logs')
            ->join('guest_lists', 'arrival_logs.guest_list_id', '=', 'guest_lists.id')
            ->where('guest_lists.attraction_id', $attractionId)
            ->whereBetween('arrival_logs.arrival_date', [now()->startOfWeek(), now()->endOfWeek()])
            ->where('arrival_logs.status', 'arrived')
            ->selectRaw('COALESCE(SUM(guest_lists.total_guests), 0) as total_guests')
            ->first();

        $weekRevenue  = ($weekStats->total_guests ?? 0) * $entryFee;
        $weekVisitors = (int) ($weekStats->total_guests ?? 0);

        // ── This month ───────────────────────────────────────────────────────────
        $monthStats = DB::table('arrival_logs')
            ->join('guest_lists', 'arrival_logs.guest_list_id', '=', 'guest_lists.id')
            ->where('guest_lists.attraction_id', $attractionId)
            ->whereMonth('arrival_logs.arrival_date', now()->month)
            ->whereYear('arrival_logs.arrival_date', now()->year)
            ->where('arrival_logs.status', 'arrived')
            ->selectRaw('COALESCE(SUM(guest_lists.total_guests), 0) as total_guests')
            ->first();

        $monthRevenue  = ($monthStats->total_guests ?? 0) * $entryFee;
        $monthVisitors = (int) ($monthStats->total_guests ?? 0);

        // ── Daily trend — last 14 days ────────────────────────────────────────────
        $dailyTrend = DB::table('arrival_logs')
            ->join('guest_lists', 'arrival_logs.guest_list_id', '=', 'guest_lists.id')
            ->where('guest_lists.attraction_id', $attractionId)
            ->where('arrival_logs.arrival_date', '>=', now()->subDays(13)->toDateString())
            ->where('arrival_logs.status', 'arrived')
            ->selectRaw('
                DATE(arrival_logs.arrival_date) as date,
                COUNT(arrival_logs.log_id) as arrivals,
                COALESCE(SUM(guest_lists.total_guests), 0) as visitors
            ')
            ->groupBy(DB::raw('DATE(arrival_logs.arrival_date)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Fill in missing days with zeros
        $dailyTrendFilled = [];
        for ($i = 13; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $row  = $dailyTrend->get($date);
            $guests = (int) ($row->visitors ?? 0);
            $dailyTrendFilled[] = [
                'date'     => $date,
                'label'    => now()->subDays($i)->format('M d'),
                'arrivals' => (int) ($row->arrivals ?? 0),
                'visitors' => $guests,
                'revenue'  => $guests * $entryFee,
            ];
        }

        // ── Hourly traffic today ──────────────────────────────────────────────────
        $hourlyRaw = DB::table('arrival_logs')
            ->join('guest_lists', 'arrival_logs.guest_list_id', '=', 'guest_lists.id')
            ->where('guest_lists.attraction_id', $attractionId)
            ->whereDate('arrival_logs.arrival_date', today())
            ->where('arrival_logs.status', 'arrived')
            ->selectRaw('HOUR(arrival_logs.arrival_time) as hour, COALESCE(SUM(guest_lists.total_guests), 0) as visitors')
            ->groupBy(DB::raw('HOUR(arrival_logs.arrival_time)'))
            ->get()
            ->keyBy('hour');

        $hourlyTraffic = [];
        for ($h = 6; $h <= 18; $h++) {
            $row = $hourlyRaw->get($h);
            $hourlyTraffic[] = [
                'hour'     => $h,
                'label'    => sprintf('%02d:00', $h),
                'visitors' => (int) ($row->visitors ?? 0),
            ];
        }

        // ── Visitor type breakdown (all time for this attraction) ─────────────────
        $typeBreakdown = DB::table('arrival_logs')
            ->join('guest_lists', 'arrival_logs.guest_list_id', '=', 'guest_lists.id')
            ->where('guest_lists.attraction_id', $attractionId)
            ->where('arrival_logs.status', 'arrived')
            ->selectRaw('
                COALESCE(SUM(guest_lists.local_tourists), 0) as local_tourists,
                COALESCE(SUM(guest_lists.foreign_tourists), 0) as foreign_tourists,
                COALESCE(SUM(guest_lists.total_guests), 0) as total_guests
            ')
            ->first();

        // ── Top 5 busiest days ever ───────────────────────────────────────────────
        $busiestDays = DB::table('arrival_logs')
            ->join('guest_lists', 'arrival_logs.guest_list_id', '=', 'guest_lists.id')
            ->where('guest_lists.attraction_id', $attractionId)
            ->where('arrival_logs.status', 'arrived')
            ->selectRaw('DATE(arrival_logs.arrival_date) as date, COALESCE(SUM(guest_lists.total_guests), 0) as visitors')
            ->groupBy(DB::raw('DATE(arrival_logs.arrival_date)'))
            ->orderByDesc('visitors')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'attraction' => [
                    'id'        => $attraction->id,
                    'name'      => $attraction->name,
                    'entry_fee' => $entryFee,
                ],
                'summary' => [
                    'today_revenue'   => $todayRevenue,
                    'today_visitors'  => $todayVisitors,
                    'today_arrivals'  => $todayArrivals,
                    'week_revenue'    => $weekRevenue,
                    'week_visitors'   => $weekVisitors,
                    'month_revenue'   => $monthRevenue,
                    'month_visitors'  => $monthVisitors,
                ],
                'daily_trend'     => $dailyTrendFilled,
                'hourly_traffic'  => $hourlyTraffic,
                'visitor_types'   => [
                    'local'   => (int) ($typeBreakdown->local_tourists ?? 0),
                    'foreign' => (int) ($typeBreakdown->foreign_tourists ?? 0),
                    'total'   => (int) ($typeBreakdown->total_guests ?? 0),
                ],
                'busiest_days' => $busiestDays,
            ],
        ]);
    }
}
