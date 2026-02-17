<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AttractionController;
use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\Admin\AccommodationController;
use App\Http\Controllers\Portal\HomeController;
use App\Http\Controllers\Portal\ActivityDetailController;
use App\Http\Controllers\Portal\AttractionDetailController;
use App\Http\Controllers\Portal\ContactController;
use App\Http\Controllers\Portal\AboutController;

Route::redirect('/', '/login')->name('home');

// Public Tourism Portal Routes (No Authentication Required)
Route::prefix('portal')->name('portal.')->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');
    Route::get('about', [AboutController::class, 'show'])->name('about');
    Route::get('activity/{activity}', [ActivityDetailController::class, 'show'])->name('activity.show');
    Route::get('attraction/{attraction}', [AttractionDetailController::class, 'show'])->name('attraction.show');
    
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
Route::get('tourist-dashboard', function () {
    return Inertia::render('dashboards/tourist-dashboard');
})->middleware(['auth', 'verified'])->name('tourist.dashboard');

Route::get('operator-dashboard', function () {
    return Inertia::render('dashboards/operator-dashboard');
})->middleware(['auth', 'verified'])->name('operator.dashboard');

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
});

require __DIR__.'/settings.php';
