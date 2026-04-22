<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\OperatorAlert;
use App\Models\OperatorDocument;
use App\Models\GuestList;
use App\Models\GuideAssignment;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class OperatorDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get operator profile info
        $operatorProfile = [
            'business_name' => $user->userProfile?->business_name ?? 'Your Business',
            'status' => $user->userProfile?->account_status ?? 'pending',
            'phone' => $user->userProfile?->phone ?? '',
            'address' => $user->userProfile?->address ?? '',
        ];

        // Get services stats
        $totalServices = Service::where('operator_id', $user->id)->count();
        $approvedServices = Service::where('operator_id', $user->id)->where('status', 'approved')->count();
        $pendingServices = Service::where('operator_id', $user->id)->where('status', 'pending')->count();

        // Get today's statistics
        $todayStart = Carbon::now()->startOfDay();
        $todayEnd = Carbon::now()->endOfDay();

        $todayBookings = GuestList::whereDate('created_at', Carbon::today())
            ->where('operator_id', $user->id)
            ->count();

        $todayGuests = GuestList::whereDate('created_at', Carbon::today())
            ->where('operator_id', $user->id)
            ->sum('total_guests') ?? 0;

        // Get upcoming guide assignments (next 7 days)
        $upcomingActivities = GuideAssignment::whereHas('guestList', function ($query) use ($user) {
                $query->where('operator_id', $user->id);
            })
            ->where('assignment_date', '>=', Carbon::now())
            ->where('assignment_date', '<=', Carbon::now()->addDays(7))
            ->with(['guide', 'guestList'])
            ->orderBy('assignment_date')
            ->get()
            ->map(function ($assignment) {
                return [
                    'guide_assignment_id' => $assignment->id,
                    'date' => $assignment->assignment_date->format('M d, Y'),
                    'time' => $assignment->start_time->format('h:i A'),
                    'guide_name' => $assignment->guide?->full_name ?? 'Unassigned',
                    'service_name' => $assignment->service_type ?? 'Tour Service',
                    'status' => $assignment->assignment_status,
                ];
            })
            ->take(5);

        // Get pending documents expiring soon
        $expiringDocuments = OperatorDocument::where('user_id', $user->id)
            ->where('expires_date', '!=', null)
            ->where('expires_date', '<=', Carbon::now()->addDays(30))
            ->where('expires_date', '>', Carbon::now())
            ->orderBy('expires_date')
            ->get()
            ->map(function ($doc) {
                $daysLeft = Carbon::now()->diffInDays($doc->expires_date, false);
                return [
                    'document_id' => $doc->id,
                    'document_type' => $doc->name,
                    'expiry_date' => $doc->expires_date->format('M d, Y'),
                    'days_left' => max(0, $daysLeft),
                    'status' => $doc->status,
                ];
            });

        $expiredDocuments = OperatorDocument::where('user_id', $user->id)
            ->where('expires_date', '<=', Carbon::now())
            ->count();

        // Get active alerts
        $alerts = OperatorAlert::where('operator_id', $user->id)
            ->whereIn('status', ['Active', 'Acknowledged'])
            ->orderByDesc('priority_level')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($alert) {
                return [
                    'operator_alert_id' => $alert->id,
                    'message' => $alert->description,
                    'type' => $this->getAlertType($alert->alert_type),
                    'priority' => $alert->priority_level,
                    'created_at' => $alert->created_at->diffForHumans(),
                ];
            })
            ->take(5);

        // Get pending guest submissions
        $pendingGuestSubmissions = GuestList::where('operator_id', $user->id)
            ->where('status', 'Pending Entrance')
            ->count();

        // Action items
        $actionItems = [];
        
        if ($pendingGuestSubmissions > 0) {
            $actionItems[] = "Submit guest list for {$pendingGuestSubmissions} activity";
        }

        foreach ($expiringDocuments as $doc) {
            if ($doc['days_left'] <= 5) {
                $actionItems[] = "{$doc['document_type']} expires in {$doc['days_left']} days";
            }
        }

        if ($expiredDocuments > 0) {
            $actionItems[] = "{$expiredDocuments} document(s) have expired - urgent action required";
        }

        if ($pendingServices > 0) {
            $actionItems[] = "You have {$pendingServices} service(s) pending approval";
        }

        // Get recent services (last 5)
        $recentServices = Service::where('operator_id', $user->id)
            ->orderByDesc('created_at')
            ->take(5)
            ->get()
            ->map(function ($service) {
                return [
                    'service_id' => $service->service_id,
                    'service_name' => $service->service_name,
                    'service_type' => $service->service_type,
                    'status' => $service->status,
                    'created_at' => $service->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('dashboards/operator-dashboard', [
            'operatorProfile' => $operatorProfile,
            'stats' => [
                'totalServices' => $totalServices,
                'approvedServices' => $approvedServices,
                'pendingServices' => $pendingServices,
                'todayBookings' => $todayBookings,
                'todayGuests' => $todayGuests,
                'upcomingActivitiesCount' => $upcomingActivities->count(),
                'pendingGuestSubmissions' => $pendingGuestSubmissions,
                'expiringDocuments' => $expiringDocuments->count(),
                'expiredDocuments' => $expiredDocuments,
            ],
            'upcomingActivities' => $upcomingActivities,
            'alerts' => $alerts,
            'actionItems' => $actionItems,
            'recentServices' => $recentServices,
            'expiringDocuments' => $expiringDocuments,
        ]);
    }

    private function getAlertType($type)
    {
        return match($type) {
            'weather' => 'Weather Alert',
            'guide' => 'Guide Alert',
            'capacity' => 'Capacity Alert',
            'guest' => 'Guest Alert',
            'document' => 'Document Alert',
            'system' => 'System Alert',
            default => 'Alert',
        };
    }
}
