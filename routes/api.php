<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StaffArrivalidateController;

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
