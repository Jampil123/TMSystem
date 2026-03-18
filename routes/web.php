<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AttractionController;
use App\Http\Controllers\Admin\OperatorManagementController;
use App\Http\Controllers\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Portal\HomeController;
use App\Http\Controllers\Portal\AttractionDetailController;
use App\Http\Controllers\Portal\ContactController;
use App\Http\Controllers\Portal\AboutController;
use App\Http\Controllers\Portal\OperatorController;
use App\Http\Controllers\Operator\ProfileController;
use App\Http\Controllers\Operator\DocumentController;
use App\Http\Controllers\Operator\ServiceController;
use App\Http\Controllers\Operator\GuestSubmissionController;
use App\Http\Controllers\Operator\AlertController;
use App\Http\Controllers\Admin\GuideManagementController;
use App\Http\Controllers\Admin\GuideAvailabilityController;
use App\Http\Controllers\Admin\CapacityRuleController;
use App\Http\Controllers\Admin\SafetyAlertController;
use App\Http\Controllers\Admin\EmergencyAlertController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\Dashboard\TouristDashboardController;
use App\Http\Controllers\Tourist\ExploreAttractionController;
use App\Http\Controllers\Tourist\OperatorListingController;
use App\Http\Controllers\StaffArrivalidateController;

Route::redirect('/', '/login')->name('home');

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
});

// Main dashboard - redirects to role-based dashboard
Route::get('dashboard', function () {
    $user = auth()->user();
    $role = $user?->role?->name ?? 'Tourist';
    
    return match($role) {
        'Tourist' => redirect()->route('tourist.dashboard'),
        'External Operator' => redirect()->route('operator.dashboard'),
        'LGU Officer' => redirect()->route('lgu-dot.dashboard'),
        'Tourism Officer' => redirect()->route('lgu-dot.dashboard'),
        'Tourism Staff' => redirect()->route('staff.dashboard'),
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
    Route::get('tourist/operators', [OperatorListingController::class, 'index'])->name('tourist.operators');
});

Route::get('operator-dashboard', function () {
    return Inertia::render('dashboards/operator-dashboard');
})->middleware(['auth', 'verified'])->name('operator.dashboard');

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

    Route::delete('operator/guest-submission/{id}', [GuestSubmissionController::class, 'destroy'])
        ->name('operator.guest-submission.destroy');
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

Route::get('lgu-dot-dashboard', function () {
    return Inertia::render('dashboards/lgu-dot-dashboard');
})->middleware(['auth', 'verified'])->name('lgu-dot.dashboard');

Route::get('staff-dashboard', function () {
    return Inertia::render('dashboards/staff-dashboard');
})->middleware(['auth', 'verified'])->name('staff.dashboard');

// Staff Features Routes
Route::middleware(['auth', 'verified'])->prefix('staff')->name('staff.')->group(function () {
    Route::get('qr-scanner', function () {
        return Inertia::render('staff/qr-scanner');
    })->name('qr-scanner');

    Route::get('arrivals', function () {
        return Inertia::render('staff/arrivals');
    })->name('arrivals');

    Route::get('guide-verification', function () {
        return Inertia::render('staff/guide-verification');
    })->name('guide-verification');

    Route::get('visitor-counter', function () {
        return Inertia::render('staff/visitor-counter');
    })->name('visitor-counter');

    Route::get('entry-logs', function () {
        return Inertia::render('staff/entry-logs');
    })->name('entry-logs');

    Route::get('capacity', function () {
        return Inertia::render('staff/capacity');
    })->name('capacity');

    Route::get('notifications', function () {
        return Inertia::render('staff/notifications');
    })->name('notifications');

    Route::get('reports', function () {
        return Inertia::render('staff/reports');
    })->name('reports');

    // Staff API Endpoints for arrival logging
    Route::post('api/validate-booking', [StaffArrivalidateController::class, 'validateBooking'])->name('api.validate-booking');
    Route::post('api/log-arrival', [StaffArrivalidateController::class, 'logArrival'])->name('api.log-arrival');
    Route::post('api/deny-arrival', [StaffArrivalidateController::class, 'denyArrival'])->name('api.deny-arrival');
    Route::get('api/arrivals-today', [StaffArrivalidateController::class, 'getTodayArrivals'])->name('api.arrivals-today');
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
    Route::get('notifications', function () {
        return Inertia::render('notifications');
    })->name('notifications');
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
    Route::get('/admin/api/capacity-rules', [CapacityRuleController::class, 'index'])->name('capacity-rules.index');
    Route::post('/admin/api/capacity-rules', [CapacityRuleController::class, 'update'])->name('capacity-rules.update');
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
