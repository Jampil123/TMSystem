<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AttractionController;
use App\Http\Controllers\Admin\OperatorManagementController;
use App\Http\Controllers\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Admin\MapController;
use App\Http\Controllers\Admin\AdminNotificationController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\Portal\HomeController;
use App\Http\Controllers\Portal\AttractionDetailController;
use App\Http\Controllers\Portal\ContactController;
use App\Http\Controllers\Portal\AboutController;
use App\Http\Controllers\Portal\OperatorController;
use App\Http\Controllers\Portal\TouristAuthController;
use App\Http\Controllers\Portal\ActivityController;
use App\Http\Controllers\Operator\ProfileController;
use App\Http\Controllers\Operator\DocumentController;
use App\Http\Controllers\Operator\ServiceController;
use App\Http\Controllers\Operator\GuestSubmissionController;
use App\Http\Controllers\Operator\AlertController;
use App\Http\Controllers\Operator\NotificationController as OperatorNotificationController;
use App\Http\Controllers\Admin\GuideManagementController;
use App\Http\Controllers\Admin\GuideAvailabilityController;
use App\Http\Controllers\Admin\CapacityRuleController;
use App\Http\Controllers\Admin\SafetyAlertController;
use App\Http\Controllers\Admin\EmergencyAlertController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\Dashboard\TouristDashboardController;
use App\Http\Controllers\Tourist\ExploreAttractionController;
use App\Http\Controllers\Tourist\ExploreActivityController;
use App\Http\Controllers\Tourist\ExploreAccommodationController;
use App\Http\Controllers\Tourist\OperatorListingController;
use App\Http\Controllers\Tourist\CrowdIdentifierController;
use App\Http\Controllers\StaffArrivalidateController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Dashboard\OperatorDashboardController;
use App\Http\Controllers\Staff\StaffAttractionController;

Route::redirect('/', '/login')->name('home');
Route::get('/activities', [ActivityController::class, 'index'])->name('activities.index');

// Custom registration endpoint to handle pending users
Route::post('/register', [RegisteredUserController::class, 'store']);

// Public Tourism Portal Routes (No Authentication Required)
Route::prefix('portal')->name('portal.')->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');
    Route::get('about', [AboutController::class, 'show'])->name('about');
    Route::get('attraction/{attraction}', [AttractionDetailController::class, 'show'])->name('attraction.show');
    Route::get('operators', [OperatorController::class, 'index'])->name('operators');
    
    Route::get('destinations', function () {
        return Inertia::render('portal/destinations');
    })->name('destinations');
    
    Route::get('attractions', function () {
        return Inertia::render('portal/attractions');
    })->name('attractions');
    
    Route::get('tours', function () {
        return Inertia::render('portal/tours');
    })->name('tours');
    
    Route::get('contact', [ContactController::class, 'show'])->name('contact');
    Route::post('contact', [ContactController::class, 'store'])->name('contact.store');
    
    Route::get('login', function () {
        return Inertia::render('portal/auth/Login');
    })->name('login');
    
    Route::post('login', [TouristAuthController::class, 'login'])->name('login.store');
    
    Route::get('register', function () {
        return Inertia::render('portal/auth/Register');
    })->name('register');
    
    Route::post('register', [RegisteredUserController::class, 'store'])->name('register.store');
    
    Route::get('forgot-password', function () {
        return Inertia::render('portal/auth/ForgotPassword');
    })->name('password.request');
    
    Route::post('password/email', function () {
        return response()->json(['message' => 'Password reset link sent']);
    })->name('password.email');
    
    Route::post('logout', [TouristAuthController::class, 'logout'])->middleware('auth')->name('logout');
});

// Badian Portal Routes
Route::prefix('badian-portal')->name('badian.')->group(function () {
    Route::get('/', function () {
        $attractions = \App\Models\Attraction::query()
            ->where('status', 'active')
            ->select(['id', 'name', 'description', 'location', 'category', 'image_url', 'rating', 'entry_fee'])
            ->orderBy('name')
            ->get();

        return Inertia::render('badian-portal/home', [
            'attractions' => $attractions,
        ]);
    })->name('home');
    Route::get('/register', function () {
        return Inertia::render('badian-portal/register');
    })->name('register');
    Route::post('/login', [TouristAuthController::class, 'login'])->name('login');
    Route::post('/logout', [TouristAuthController::class, 'logout'])->middleware('auth')->name('logout');
    Route::get('/dashboard', function () {
        return Inertia::render('badian-portal/dashboard');
    })->name('dashboard')->middleware('auth');
    Route::get('/portal-home', function () {
        $today = now()->toDateString();
        $crowdByAttraction = \App\Models\ArrivalLog::query()
            ->join('guest_lists', 'arrival_logs.guest_list_id', '=', 'guest_lists.id')
            ->whereDate('arrival_logs.arrival_date', $today)
            ->where(function ($query) {
                $query->whereNull('arrival_logs.status')
                    ->orWhere('arrival_logs.status', '!=', 'Departed');
            })
            ->whereNotNull('guest_lists.attraction_id')
            ->groupBy('guest_lists.attraction_id')
            ->selectRaw('guest_lists.attraction_id as attraction_id, COUNT(arrival_logs.log_id) as current_tourists')
            ->pluck('current_tourists', 'attraction_id');

        $attractions = \App\Models\Attraction::query()
            ->where('status', 'active')
            ->select([
                'id',
                'name',
                'description',
                'location',
                'category',
                'image_url',
                'rating',
                'entry_fee',
                'latitude',
                'longitude',
            ])
            ->orderByDesc('rating')
            ->orderBy('name')
            ->get();

        return Inertia::render('badian-portal/portal-home', [
            'attractions' => $attractions->map(fn ($a) => [
                'id' => $a->id,
                'name' => $a->name,
                'description' => $a->description,
                'location' => $a->location,
                'category' => $a->category,
                'image_url' => $a->image_url,
                'rating' => $a->rating,
                'entry_fee' => $a->entry_fee,
                'latitude' => $a->latitude,
                'longitude' => $a->longitude,
                'current_tourists' => (int) ($crowdByAttraction[$a->id] ?? 0),
            ]),
            'asOfDate' => $today,
        ]);
    })->name('portal-home')->middleware('auth');
    Route::get('/about', function () {
        $attractions = \App\Models\Attraction::query()
            ->where('status', 'active')
            ->select(['id', 'name'])
            ->orderBy('name')
            ->limit(5)
            ->get();

        $activities = \App\Models\Service::query()
            ->select(['service_name'])
            ->whereIn('service_type', ['Activity', 'adventure', 'tour'])
            ->orderBy('service_name')
            ->limit(5)
            ->get();

        return Inertia::render('badian-portal/about', [
            'attractions' => $attractions,
            'activities' => $activities,
        ]);
    })->name('about');
    Route::get('/attractions', function () {
        $attractions = \App\Models\Attraction::query()
            ->where('status', 'active')
            ->select(['id', 'name', 'description', 'location', 'category', 'image_url', 'rating', 'entry_fee'])
            ->orderBy('name')
            ->get();

        return Inertia::render('badian-portal/attractions', [
            'attractions' => $attractions,
        ]);
    })->name('attractions');
    Route::get('/operators', function () {
        $operators = \App\Models\User::query()
            ->whereHas('role', fn ($query) => $query->where('name', 'External Operator'))
            ->with(['profile'])
            ->select(['id', 'name', 'email', 'username'])
            ->orderBy('name')
            ->get()
            ->map(fn ($operator) => [
                'id' => $operator->id,
                'name' => $operator->name,
                'email' => $operator->email,
                'username' => $operator->username,
                'company_name' => $operator->profile?->company_name,
                'contact_number' => $operator->profile?->contact_number,
                'office_address' => $operator->profile?->office_address,
            ]);

        return Inertia::render('badian-portal/operators', [
            'operators' => $operators,
        ]);
    })->name('operators');
    Route::get('/crowd-identifier', function () {
        $today = now()->toDateString();

        $attractions = \App\Models\Attraction::query()
            ->where('status', 'active')
            ->select(['id', 'name', 'location', 'category'])
            ->orderBy('name')
            ->get();

        $capacityRules = \App\Models\CapacityRule::query()
            ->select(['attraction_id', 'max_visitors'])
            ->get();

        $globalCapacityRule = $capacityRules->firstWhere('attraction_id', null);
        $capacityByAttractionId = $capacityRules
            ->filter(fn ($rule) => !is_null($rule->attraction_id))
            ->keyBy('attraction_id');

        $arrivalsByAttraction = \App\Models\ArrivalLog::query()
            ->join('guest_lists', 'arrival_logs.guest_list_id', '=', 'guest_lists.id')
            ->whereDate('arrival_logs.arrival_date', $today)
            ->where(function ($query) {
                $query->whereNull('arrival_logs.status')
                    ->orWhere('arrival_logs.status', '!=', 'Departed');
            })
            ->whereNotNull('guest_lists.attraction_id')
            ->groupBy('guest_lists.attraction_id')
            ->selectRaw('guest_lists.attraction_id as attraction_id, COUNT(arrival_logs.log_id) as current_tourists')
            ->pluck('current_tourists', 'attraction_id');

        $crowdData = $attractions->map(function ($attraction) use ($arrivalsByAttraction, $capacityByAttractionId, $globalCapacityRule) {
            $currentTourists = (int) ($arrivalsByAttraction[$attraction->id] ?? 0);

            $capacityRule = $capacityByAttractionId->get($attraction->id);
            $maxVisitors = (int) ($capacityRule?->max_visitors
                ?? $globalCapacityRule?->max_visitors
                ?? 0);

            $utilizationPercent = $maxVisitors > 0
                ? min(100, round(($currentTourists / $maxVisitors) * 100, 1))
                : 0;

            $crowdLevel = match (true) {
                $utilizationPercent >= 90 => 'Critical',
                $utilizationPercent >= 75 => 'High',
                $utilizationPercent >= 50 => 'Moderate',
                $utilizationPercent >= 25 => 'Low',
                default => 'Very Low',
            };

            return [
                'id' => $attraction->id,
                'name' => $attraction->name,
                'location' => $attraction->location,
                'category' => $attraction->category,
                'current_tourists' => $currentTourists,
                'max_visitors' => $maxVisitors,
                'utilization_percent' => $utilizationPercent,
                'crowd_level' => $crowdLevel,
            ];
        })->sortByDesc('utilization_percent')->values();

        return Inertia::render('badian-portal/crowd-identifier', [
            'crowdData' => $crowdData,
            'asOfDate' => $today,
        ]);
    })->name('crowd-identifier');
    Route::get('/services', function () {
        $services = \App\Models\Service::query()
            ->with(['operator:id,name,email', 'touristSpot:id,name,location,image_url'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($service) => [
                'service_id' => $service->service_id,
                'service_name' => $service->service_name,
                'service_type' => $service->service_type,
                'description' => $service->description,
                'facebook_url' => $service->facebook_url,
                'status' => $service->status,
                'operator_name' => $service->operator?->name,
                'operator_email' => $service->operator?->email,
                'attraction_name' => $service->touristSpot?->name,
                'attraction_location' => $service->touristSpot?->location,
                'attraction_image' => $service->touristSpot?->image_url,
            ]);

        return Inertia::render('badian-portal/services', [
            'services' => $services,
        ]);
    })->name('services');
    Route::get('/accomodations', function () {
        $accommodations = \App\Models\Accommodation::query()
            ->with([
                'service.operator:id,name,email',
                'service.touristSpot:id,name,location,image_url',
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($accommodation) => [
                'accommodation_id' => $accommodation->accommodation_id,
                'service_id' => $accommodation->service_id,
                'service_name' => $accommodation->service?->service_name,
                'description' => $accommodation->service?->description,
                'status' => $accommodation->service?->status,
                'operator_name' => $accommodation->service?->operator?->name,
                'operator_email' => $accommodation->service?->operator?->email,
                'attraction_name' => $accommodation->service?->touristSpot?->name,
                'attraction_location' => $accommodation->service?->touristSpot?->location,
                'attraction_image' => $accommodation->service?->touristSpot?->image_url,
                'room_type' => $accommodation->room_type,
                'capacity' => $accommodation->capacity,
                'price_per_night' => $accommodation->price_per_night,
                'total_rooms' => $accommodation->total_rooms,
            ]);

        return Inertia::render('badian-portal/accomodations', [
            'accommodations' => $accommodations,
        ]);
    })->name('accomodations');
    Route::redirect('/accommodations', '/badian-portal/accomodations');
    Route::get('/notifications', function () {
        $user = auth()->user();
        abort_unless($user, 403);

        $notifications = \App\Models\Notification::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(200)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->message,
                'details' => $notification->details,
                'type' => $notification->type,
                'severity' => $notification->severity ?? $notification->notification_type,
                'notification_type' => $notification->notification_type,
                'is_read' => $notification->is_read,
                'time_ago' => $notification->created_at?->diffForHumans(),
                'created_at' => $notification->created_at?->format('Y-m-d H:i:s'),
            ]);

        $unreadCount = \App\Models\Notification::query()
            ->where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        return Inertia::render('badian-portal/notifications', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    })->name('notifications')->middleware('auth');
    Route::post('/notifications/mark-all-read', function () {
        $user = auth()->user();
        abort_unless($user, 403);

        \App\Models\Notification::query()
            ->where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return back();
    })->name('notifications.mark-all-read')->middleware('auth');
    Route::post('/notifications/{notification}/mark-read', function (\App\Models\Notification $notification) {
        $user = auth()->user();
        abort_unless($user && $notification->user_id === $user->id, 403);

        if (! $notification->is_read) {
            $notification->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return back();
    })->name('notifications.mark-read')->middleware('auth');
});

// Main dashboard - redirects to role-based dashboard
Route::get('dashboard', function () {
    $user = auth()->user();
    $role = $user?->role?->name ?? 'Tourist';
    $portalContext = session('portal_context');
    
    return match($role) {
        'Tourist' => $portalContext === 'badian'
            ? redirect()->route('badian.portal-home')
            : redirect()->route('tourist.dashboard'),
        'External Operator' => redirect()->route('operator.dashboard'),
        'LGU Officer' => redirect()->route('lgu-dot.dashboard'),
        'Tourism Officer' => redirect()->route('lgu-dot.dashboard'),
        'Tourism Staff' => redirect()->route('staff.select-attraction'),
        'Admin' => redirect()->route('lgu-dot.dashboard'),
        default => Inertia::render('dashboard'),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

// Role-based dashboards
Route::get('tourist-dashboard', [TouristDashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('tourist.dashboard');

// Tourist Explore Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('tourist/attractions', [ExploreAttractionController::class, 'index'])->name('tourist.attractions');
    Route::get('tourist/activities', [ExploreActivityController::class, 'index'])->name('tourist.activities');
    Route::get('tourist/accommodations', [ExploreAccommodationController::class, 'index'])->name('tourist.accommodations');
    Route::get('tourist/operators', [OperatorListingController::class, 'index'])->name('tourist.operators');
    Route::get('tourist/crowd-identifier', [CrowdIdentifierController::class, 'index'])->name('tourist.crowd-identifier');
});

Route::get('operator-dashboard', [OperatorDashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('operator.dashboard');

Route::get('operator/documents', [DocumentController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('operator.documents');

Route::post('operator/documents/upload', [DocumentController::class, 'upload'])
    ->middleware(['auth', 'verified'])
    ->name('operator.documents.upload');

Route::delete('operator/documents/{document}', [DocumentController::class, 'destroy'])
    ->middleware(['auth', 'verified'])
    ->name('operator.documents.destroy');

Route::post('operator/documents/submit', [DocumentController::class, 'submit'])
    ->middleware(['auth', 'verified'])
    ->name('operator.documents.submit');

Route::get('operator/profile', [ProfileController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('operator.profile');

Route::post('operator/profile', [ProfileController::class, 'update'])
    ->middleware(['auth', 'verified'])
    ->name('operator.profile.update');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('operator/services', [ServiceController::class, 'index'])
        ->name('operator.services.index');

    Route::get('operator/services/create', [ServiceController::class, 'create'])
        ->name('operator.services.create');

    Route::get('operator/services/requests', [ServiceController::class, 'requests'])
        ->name('operator.services.requests');

    Route::post('operator/services', [ServiceController::class, 'store'])
        ->name('operator.services.store');

    Route::get('operator/services/{service}', [ServiceController::class, 'show'])
        ->name('operator.services.show');

    Route::get('operator/services/{service}/edit', [ServiceController::class, 'edit'])
        ->name('operator.services.edit');

    Route::put('operator/services/{service}', [ServiceController::class, 'update'])
        ->name('operator.services.update');

    Route::delete('operator/services/{service}', [ServiceController::class, 'destroy'])
        ->name('operator.services.destroy');
});

// Guest Submission Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('operator/guest-submission', [GuestSubmissionController::class, 'index'])
        ->name('operator.guest-submission.index');
    
    Route::post('operator/guest-submission', [GuestSubmissionController::class, 'store'])
        ->name('operator.guest-submission.store');

    Route::get('operator/guest-submission/{id}', [GuestSubmissionController::class, 'show'])
        ->name('operator.guest-submission.show');

    // Print wristbands (QR codes) for a guest submission
    Route::get('operator/guest-submission/{id}/print-qr-wristbands', [GuestSubmissionController::class, 'printWristbands'])
        ->name('operator.guest-submission.print');

    Route::delete('operator/guest-submission/{id}', [GuestSubmissionController::class, 'destroy'])
        ->name('operator.guest-submission.destroy');
});

// Operator Notifications
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('operator/notifications', [OperatorNotificationController::class, 'index'])
        ->name('operator.notifications');
    Route::post('operator/notifications/mark-all-read', [OperatorNotificationController::class, 'markAllRead'])
        ->name('operator.notifications.mark-all-read');
    Route::post('operator/notifications/{id}/mark-read', [OperatorNotificationController::class, 'markRead'])
        ->name('operator.notifications.mark-read');
    Route::delete('operator/notifications/{id}', [OperatorNotificationController::class, 'destroy'])
        ->name('operator.notifications.destroy');
    Route::get('operator/notifications/unread-count', [OperatorNotificationController::class, 'unreadCount'])
        ->name('operator.notifications.unread-count');
});

// Operator Alerts Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('operator/alerts', [AlertController::class, 'index'])
        ->name('operator.alerts.index');

    Route::get('operator/alerts/api', [AlertController::class, 'getAlerts'])
        ->name('operator.alerts.api');

    Route::get('operator/alerts/{alert}', [AlertController::class, 'show'])
        ->name('operator.alerts.show');

    Route::post('operator/alerts/{alert}/acknowledge', [AlertController::class, 'acknowledge'])
        ->name('operator.alerts.acknowledge');

    Route::post('operator/alerts/{alert}/resolve', [AlertController::class, 'resolve'])
        ->name('operator.alerts.resolve');

    Route::post('operator/alerts', [AlertController::class, 'store'])
        ->name('operator.alerts.store');
});

Route::get('lgu-dot-dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('lgu-dot.dashboard');

Route::get('staff-dashboard', [StaffAttractionController::class, 'dashboard'])
    ->middleware(['auth', 'verified'])->name('staff.dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('staff/select-attraction', [StaffAttractionController::class, 'selectAttraction'])->name('staff.select-attraction');
    Route::post('staff/select-attraction', [StaffAttractionController::class, 'storeSelectedAttraction'])->name('staff.select-attraction.store');
});

// Staff Features Routes
Route::middleware(['auth', 'verified'])->prefix('staff')->name('staff.')->group(function () {
    Route::get('qr-scanner', function () {
        return Inertia::render('staff/qr-scanner');
    })->name('qr-scanner');

    Route::get('arrivals', [StaffAttractionController::class, 'arrivals'])->name('arrivals');

    Route::get('guide-verification', function () {
        return Inertia::render('staff/guide-verification');
    })->name('guide-verification');

    Route::get('visitor-counter', [StaffAttractionController::class, 'visitorCounter'])->name('visitor-counter');

    Route::get('entry-logs', function () {
        return Inertia::render('staff/entry-logs');
    })->name('entry-logs');

    Route::get('capacity', function () {
        return Inertia::render('staff/capacity');
    })->name('capacity');

    Route::get('notifications', function () {
        return Inertia::render('staff/notifications');
    })->name('notifications');

    Route::get('reports', [StaffAttractionController::class, 'reportsPage'])->name('reports');

    // Staff API Endpoints for arrival logging
    Route::post('api/validate-booking', [StaffArrivalidateController::class, 'validateBooking'])->name('api.validate-booking');
    Route::post('api/log-arrival', [StaffArrivalidateController::class, 'logArrival'])->name('api.log-arrival');
    Route::post('api/toggle-guest-status', [StaffArrivalidateController::class, 'toggleGuestStatus'])->name('api.toggle-guest-status');
    Route::post('api/log-departure', [StaffArrivalidateController::class, 'logDeparture'])->name('api.log-departure');
    Route::post('api/deny-arrival', [StaffArrivalidateController::class, 'denyArrival'])->name('api.deny-arrival');
    Route::get('api/arrivals-today', [StaffArrivalidateController::class, 'getTodayArrivals'])->name('api.arrivals-today');
    Route::post('api/log-walk-in', [StaffArrivalidateController::class, 'logWalkInWithQR'])->name('api.log-walk-in');
    Route::get('api/reports', [StaffAttractionController::class, 'reportsApi'])->name('api.reports');
});

// Admin-only user and attraction management routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::get('operators', [OperatorManagementController::class, 'index'])->name('operators.index');
    Route::get('operators/{user}', [OperatorManagementController::class, 'show'])->name('operators.show');
    Route::put('operators/{user}/approve', [OperatorManagementController::class, 'approve'])->name('operators.approve');
    Route::put('operators/{user}/reject', [OperatorManagementController::class, 'reject'])->name('operators.reject');
    Route::put('operators/{user}/documents/{document}/approve', [OperatorManagementController::class, 'approveDocument'])->name('operators.document.approve');
    Route::put('operators/{user}/documents/{document}/reject', [OperatorManagementController::class, 'rejectDocument'])->name('operators.document.reject');

    Route::get('attractions', [AttractionController::class, 'index'])->name('attractions.index');
    Route::post('attractions', [AttractionController::class, 'store'])->name('attractions.store');
    Route::put('attractions/{attraction}', [AttractionController::class, 'update'])->name('attractions.update');
    Route::delete('attractions/{attraction}', [AttractionController::class, 'destroy'])->name('attractions.destroy');

    // Map Route for Attractions
    Route::get('map', [MapController::class, 'index'])->name('map.index');
    Route::get('api/map/attractions', [MapController::class, 'api'])->name('map.api');

    // Admin Service Management Routes
    Route::get('services', [AdminServiceController::class, 'index'])->name('services.index');
    Route::get('services/pending', [AdminServiceController::class, 'pending'])->name('services.pending');
    Route::get('services/approved', [AdminServiceController::class, 'approved'])->name('services.approved');
    Route::get('services/{service}', [AdminServiceController::class, 'show'])->name('services.show');
    Route::post('services/{service}/approve', [AdminServiceController::class, 'approve'])->name('services.approve');
    Route::post('services/{service}/reject', [AdminServiceController::class, 'reject'])->name('services.reject');
    Route::post('services/{service}/request-revision', [AdminServiceController::class, 'requestRevision'])->name('services.request-revision');

    // Capacity Rules Configuration Page
    Route::get('settings/capacity-rules', function () {
        return Inertia::render('admin/capacity-rules');
    })->name('admin.capacity-rules');

    // Safety Alerts Configuration Page
    Route::get('settings/safety-alerts', function () {
        return Inertia::render('admin/safety-alerts');
    })->name('admin.safety-alerts');

    // Emergency Alerts Management Page
    Route::get('settings/emergency-alerts', function () {
        return Inertia::render('admin/emergency-alerts');
    })->name('admin.emergency-alerts');

    // Notifications Page
    Route::get('settings/notifications', [AdminNotificationController::class, 'index'])->name('settings.notifications.index');
    Route::post('settings/notifications/{notification}/mark-read', [AdminNotificationController::class, 'markAsRead'])->name('settings.notifications.mark-read');
    Route::post('settings/notifications/{notification}/mark-unread', [AdminNotificationController::class, 'markAsUnread'])->name('settings.notifications.mark-unread');
    Route::post('settings/notifications/mark-all-as-read', [AdminNotificationController::class, 'markAllAsRead'])->name('settings.notifications.mark-all-as-read');
    Route::delete('settings/notifications/{notification}', [AdminNotificationController::class, 'destroy'])->name('settings.notifications.destroy');
    Route::post('settings/notifications/delete-read', [AdminNotificationController::class, 'deleteRead'])->name('settings.notifications.delete-read');
    Route::post('settings/notifications/delete-old', [AdminNotificationController::class, 'deleteOld'])->name('settings.notifications.delete-old');
    Route::get('settings/notifications/stats', [AdminNotificationController::class, 'stats'])->name('settings.notifications.stats');

    // Audit Logs Routes
    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('audit-logs/{auditLog}', [AuditLogController::class, 'show'])->name('audit-logs.show');
    Route::get('audit-logs/export', [AuditLogController::class, 'export'])->name('audit-logs.export');
    Route::post('audit-logs/delete-old', [AuditLogController::class, 'deleteAll'])->name('audit-logs.delete-all');
});

// Guide Registration Routes (Public) - MUST come before admin routes to avoid parameter catching
Route::get('guides/register', [GuideController::class, 'create'])->name('guides.register');
Route::post('guides/register', [GuideController::class, 'store'])->name('guides.store');
Route::get('guides/registration-success/{guide}', [GuideController::class, 'registrationSuccess'])->name('guides.registration-success');

// Guide Management Routes (Admin) - MUST come after public routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('guides/create', [GuideManagementController::class, 'create'])->name('guides.create');
    Route::get('guides/availability', [GuideAvailabilityController::class, 'index'])->name('guides.availability');
    Route::post('guides/availability', [GuideAvailabilityController::class, 'store'])->name('guides.availability.store');
    Route::put('guides/availability/{availability}', [GuideAvailabilityController::class, 'update'])->name('guides.availability.update');
    Route::delete('guides/availability/{availability}', [GuideAvailabilityController::class, 'destroy'])->name('guides.availability.destroy');
    Route::get('guides', [GuideManagementController::class, 'index'])->name('guides.index');
    Route::get('guides/{guide}', [GuideManagementController::class, 'show'])->name('guides.show');
    Route::post('guides/{guide}/approve', [GuideManagementController::class, 'approve'])->name('guides.approve');
    Route::post('guides/{guide}/reject', [GuideManagementController::class, 'reject'])->name('guides.reject');
    Route::get('guides/export/csv', [GuideManagementController::class, 'export'])->name('guides.export');

    // Guide Assignment Routes (5.3 Implementation) - also available to non-admin users
    Route::get('guest-lists/{guestList}/eligible-guides', [GuideController::class, 'getEligibleGuides'])->name('guide-assignments.eligible');
    Route::post('guest-lists/{guestList}/assign-guide', [GuideController::class, 'assignGuide'])->name('guide-assignments.store');
    Route::post('guest-lists/{guestList}/auto-assign-guide', [GuideController::class, 'autoAssignGuide'])->name('guide-assignments.auto');
    Route::post('guide-assignments/{assignment}/confirm', [GuideController::class, 'confirmAssignment'])->name('guide-assignments.confirm');
    Route::post('guide-assignments/{assignment}/complete', [GuideController::class, 'completeAssignment'])->name('guide-assignments.complete');
    Route::post('guide-assignments/{assignment}/cancel', [GuideController::class, 'cancelAssignment'])->name('guide-assignments.cancel');
    Route::get('guide-assignments/{assignment}', [GuideController::class, 'getAssignmentDetails'])->name('guide-assignments.show');
});

// Duplicate assignment endpoints for operators/general users
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('guest-lists/{guestList}/eligible-guides', [GuideController::class, 'getEligibleGuides']);
    Route::get('guest-lists/{guestList}/debug-eligible-guides', [GuideController::class, 'debugEligibleGuides']);
    Route::post('guest-lists/{guestList}/assign-guide', [GuideController::class, 'assignGuide']);
    Route::post('guest-lists/{guestList}/auto-assign-guide', [GuideController::class, 'autoAssignGuide']);
});

// QR Code Arrival Logging Routes - for entrance staff
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/staff/api/qr-arrival', [\App\Http\Controllers\QRCodeArrivalController::class, 'processQRCode'])->name('qr-arrival.process');
    Route::post('/staff/api/check-guide', [\App\Http\Controllers\QRCodeArrivalController::class, 'checkGuidePresence'])->name('qr-arrival.verify-guide');
    Route::get('/staff/api/arrival-stats', [\App\Http\Controllers\QRCodeArrivalController::class, 'getTodayStats'])->name('qr-arrival.stats');
    Route::get('/staff/api/recent-arrivals', [\App\Http\Controllers\QRCodeArrivalController::class, 'getRecentArrivals'])->name('qr-arrival.recent');
    Route::get('/staff/api/visitor-count', [\App\Http\Controllers\QRCodeArrivalController::class, 'getVisitorCount'])->name('qr-arrival.visitor-count');
    Route::get('/staff/api/capacity-history', [\App\Http\Controllers\QRCodeArrivalController::class, 'getCapacityHistory'])->name('qr-arrival.capacity-history');
});

// Notification API Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/staff/api/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/staff/api/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::get('/staff/api/notifications/unread-by-severity', [\App\Http\Controllers\NotificationController::class, 'getUnreadBySeverity'])->name('notifications.unread-by-severity');
    Route::get('/staff/api/notifications/critical', [\App\Http\Controllers\NotificationController::class, 'getCritical'])->name('notifications.critical');
    Route::get('/staff/api/notifications/by-severity', [\App\Http\Controllers\NotificationController::class, 'getBySeverity'])->name('notifications.by-severity');
    Route::get('/staff/api/notifications/recent', [\App\Http\Controllers\NotificationController::class, 'recent'])->name('notifications.recent');
    Route::post('/staff/api/notifications/{id}/mark-read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('/staff/api/notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::delete('/staff/api/notifications/{id}', [\App\Http\Controllers\NotificationController::class, 'delete'])->name('notifications.delete');
    Route::post('/staff/api/create-notification', [\App\Http\Controllers\NotificationController::class, 'createNotification'])->name('notifications.create');
});

// Capacity Rules API Routes (Admin)
Route::middleware(['auth', 'verified'])->group(function () {
    // Attraction API endpoints
    Route::get('/admin/api/attractions', [AttractionController::class, 'apiIndex'])->name('api.attractions.index');
    
    // Guide API endpoints
    Route::get('/admin/api/guides', [GuideController::class, 'apiIndex'])->name('api.guides.index');
    
    Route::get('/admin/api/capacity-rules', [CapacityRuleController::class, 'index'])->name('capacity-rules.index');
    Route::get('/admin/api/capacity-rules/all', [CapacityRuleController::class, 'allRules'])->name('capacity-rules.all');
    Route::post('/admin/api/capacity-rules', [CapacityRuleController::class, 'update'])->name('capacity-rules.update');
    Route::post('/admin/api/capacity-rules/{attractionId}', [CapacityRuleController::class, 'saveAttractionRules'])->name('capacity-rules.save-attraction');
    Route::get('/admin/api/capacity-rules/history', [CapacityRuleController::class, 'history'])->name('capacity-rules.history');
    Route::post('/admin/api/capacity-rules/reset', [CapacityRuleController::class, 'reset'])->name('capacity-rules.reset');

    // Safety Alert API Routes
    Route::get('/admin/api/safety-alerts', [SafetyAlertController::class, 'getActiveAlerts'])->name('safety-alerts.active');
    Route::get('/admin/api/safety-alerts/recent', [SafetyAlertController::class, 'getRecent'])->name('safety-alerts.recent');
    Route::get('/admin/api/safety-alerts/summary', [SafetyAlertController::class, 'getSummary'])->name('safety-alerts.summary');
    Route::get('/admin/api/safety-alerts/critical', [SafetyAlertController::class, 'hasActiveCritical'])->name('safety-alerts.critical');
    Route::get('/admin/api/safety-alerts/by-type', [SafetyAlertController::class, 'getByType'])->name('safety-alerts.by-type');
    Route::get('/admin/api/safety-alerts/by-severity', [SafetyAlertController::class, 'getBySeverity'])->name('safety-alerts.by-severity');
    Route::post('/admin/api/safety-alerts/{alert}/resolve', [SafetyAlertController::class, 'resolve'])->name('safety-alerts.resolve');
    Route::post('/admin/api/safety-alerts/resolve-multiple', [SafetyAlertController::class, 'resolveMultiple'])->name('safety-alerts.resolve-multiple');
    Route::post('/admin/api/safety-alerts/check', [SafetyAlertController::class, 'runSafetyCheck'])->name('safety-alerts.check');
    Route::delete('/admin/api/safety-alerts/cleanup', [SafetyAlertController::class, 'cleanup'])->name('safety-alerts.cleanup');

    // Emergency Alert API Routes
    Route::get('/admin/api/emergency-alerts', [EmergencyAlertController::class, 'getActive'])->name('emergency-alerts.active');
    Route::get('/admin/api/emergency-alerts/status', [EmergencyAlertController::class, 'getStatus'])->name('emergency-alerts.status');
    Route::get('/admin/api/emergency-alerts/history', [EmergencyAlertController::class, 'getHistory'])->name('emergency-alerts.history');
    Route::get('/admin/api/emergency-alerts/entry-block', [EmergencyAlertController::class, 'getEntryBlockStatus'])->name('emergency-alerts.entry-block');
    Route::get('/admin/api/emergency-alerts/in-progress', [EmergencyAlertController::class, 'checkCondition'])->name('emergency-alerts.check-condition');
    Route::post('/admin/api/emergency-alerts/{emergency}/resolve', [EmergencyAlertController::class, 'resolve'])->name('emergency-alerts.resolve');
    Route::post('/admin/api/emergency-alerts/trigger', [EmergencyAlertController::class, 'trigger'])->name('emergency-alerts.trigger');
});

require __DIR__.'/settings.php';
