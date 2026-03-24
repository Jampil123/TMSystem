<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StaffArrivalidateController;
use App\Http\Controllers\Admin\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

// LGU/DOT Dashboard API Routes
Route::middleware(['auth', 'verified'])->prefix('dashboard')->name('dashboard.')->group(function () {
    // Get real-time dashboard data
    Route::get('data', [DashboardController::class, 'getData'])->name('data');
    
    // Get alerts
    Route::get('alerts', [DashboardController::class, 'getAlerts'])->name('alerts');
    
    // Get arrival statistics
    Route::get('arrivals/stats', [DashboardController::class, 'getArrivalStats'])->name('arrivals.stats');
    
    // Get guide deployment statistics
    Route::get('guides/stats', [DashboardController::class, 'getGuideStats'])->name('guides.stats');
    
    // Get emergency logs
    Route::get('emergencies', [DashboardController::class, 'getEmergencyLogs'])->name('emergencies');
    
    // Resolve alert
    Route::post('alerts/{alert}/resolve', [DashboardController::class, 'resolveAlert'])->name('alerts.resolve');
});

Route::middleware(['auth', 'verified'])->prefix('staff')->name('staff.')->group(function () {
    // Validate booking code from QR scan
    Route::post('validate-booking', [StaffArrivalidateController::class, 'validateBooking'])->name('validate-booking');
    
    // Log arrival
    Route::post('log-arrival', [StaffArrivalidateController::class, 'logArrival'])->name('log-arrival');
    
    // Deny arrival
    Route::post('deny-arrival', [StaffArrivalidateController::class, 'denyArrival'])->name('deny-arrival');
    
    // Get today's arrivals
    Route::get('arrivals/today', [StaffArrivalidateController::class, 'getTodayArrivals'])->name('arrivals.today');
});
