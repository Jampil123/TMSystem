<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::redirect('/', '/login')->name('home');

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

Route::get('users', function () {
    $user = auth()->user();
    if ($user?->role?->name !== 'Admin') {
        abort(403, 'Unauthorized access to User Management');
    }
    return Inertia::render('admin/users/index');
})->middleware(['auth', 'verified'])->name('users.index');

require __DIR__.'/settings.php';
