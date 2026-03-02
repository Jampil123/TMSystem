<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AttractionController;
use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\Admin\AccommodationController;
use App\Http\Controllers\Admin\OperatorManagementController;
use App\Http\Controllers\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Portal\HomeController;
use App\Http\Controllers\Portal\ActivityDetailController;
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
use App\Http\Controllers\GuideController;
use App\Http\Controllers\Dashboard\TouristDashboardController;
use App\Http\Controllers\Tourist\ExploreActivityController;
use App\Http\Controllers\Tourist\ExploreAttractionController;
use App\Http\Controllers\Tourist\ExploreAccommodationController;
use App\Http\Controllers\Tourist\OperatorListingController;

Route::redirect('/', '/login')->name('home');

// Public Tourism Portal Routes (No Authentication Required)
Route::prefix('portal')->name('portal.')->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');
    Route::get('about', [AboutController::class, 'show'])->name('about');
    Route::get('activity/{activity}', [ActivityDetailController::class, 'show'])->name('activity.show');
    Route::get('attraction/{attraction}', [AttractionDetailController::class, 'show'])->name('attraction.show');
    Route::get('operators', [OperatorController::class, 'index'])->name('operators');
    
    Route::get('destinations', function () {
        return Inertia::render('portal/destinations');
    })->name('destinations');
    
    Route::get('attractions', function () {
        return Inertia::render('portal/attractions');
    })->name('attractions');
    
    Route::get('accommodations', function () {
        return Inertia::render('portal/accommodations');
    })->name('accommodations');
    
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
    Route::get('tourist/activities', [ExploreActivityController::class, 'index'])->name('tourist.activities');
    Route::get('tourist/attractions', [ExploreAttractionController::class, 'index'])->name('tourist.attractions');
    Route::get('tourist/accommodations', [ExploreAccommodationController::class, 'index'])->name('tourist.accommodations');
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

    Route::get('activities', [ActivityController::class, 'index'])->name('activities.index');
    Route::post('activities', [ActivityController::class, 'store'])->name('activities.store');
    Route::put('activities/{activity}', [ActivityController::class, 'update'])->name('activities.update');

    Route::get('accommodations', [AccommodationController::class, 'index'])->name('accommodations.index');
    Route::post('accommodations', [AccommodationController::class, 'store'])->name('accommodations.store');
    Route::put('accommodations/{accommodation}', [AccommodationController::class, 'update'])->name('accommodations.update');
    Route::delete('accommodations/{accommodation}', [AccommodationController::class, 'destroy'])->name('accommodations.destroy');
    Route::delete('activities/{activity}', [ActivityController::class, 'destroy'])->name('activities.destroy');

    // Admin Service Management Routes
    Route::get('services', [AdminServiceController::class, 'index'])->name('services.index');
    Route::get('services/pending', [AdminServiceController::class, 'pending'])->name('services.pending');
    Route::get('services/approved', [AdminServiceController::class, 'approved'])->name('services.approved');
    Route::get('services/{service}', [AdminServiceController::class, 'show'])->name('services.show');
    Route::post('services/{service}/approve', [AdminServiceController::class, 'approve'])->name('services.approve');
    Route::post('services/{service}/reject', [AdminServiceController::class, 'reject'])->name('services.reject');
    Route::post('services/{service}/request-revision', [AdminServiceController::class, 'requestRevision'])->name('services.request-revision');
});

// Guide Registration Routes (Public) - MUST come before admin routes to avoid parameter catching
Route::get('guides/register', [GuideController::class, 'create'])->name('guides.register');
Route::post('guides/register', [GuideController::class, 'store'])->name('guides.store');
Route::get('guides/registration-success/{guide}', [GuideController::class, 'registrationSuccess'])->name('guides.registration-success');

// Guide Management Routes (Admin) - MUST come after public routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('guides/create', [GuideManagementController::class, 'create'])->name('guides.create');
    Route::get('guides', [GuideManagementController::class, 'index'])->name('guides.index');
    Route::get('guides/{guide}', [GuideManagementController::class, 'show'])->name('guides.show');
    Route::post('guides/{guide}/approve', [GuideManagementController::class, 'approve'])->name('guides.approve');
    Route::post('guides/{guide}/reject', [GuideManagementController::class, 'reject'])->name('guides.reject');
    Route::get('guides/export/csv', [GuideManagementController::class, 'export'])->name('guides.export');
});

require __DIR__.'/settings.php';
