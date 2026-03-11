<?php

namespace App\Http\Controllers;

use App\Models\ArrivalLog;
use App\Models\GuestList;
use App\Models\Guide;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StaffArrivalidateController extends Controller
{
    /**
     * Validate a booking code against the guest_lists table
     */
    public function validateBooking(Request $request)
    {
        try {
            $bookingCode = $request->input('booking_code');

            if (!$bookingCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking code is required',
                ], 400);
            }

            // Search in guest_lists table - assumes booking code is stored or can be referenced
            // Adjust the query based on your actual guest_lists structure
            $guestList = GuestList::where('id', $bookingCode)
                ->orWhere('service_id', $bookingCode)
                ->first();

            if (!$guestList) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found in system',
                    'issues' => ['❌ Booking code not found - please verify the QR code and try again'],
                ], 404);
            }

            // Validate booking details
            $validation = $this->validateGuestList($guestList);

            if (!$validation['allValid']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking validation failed',
                    'issues' => $validation['issues'],
                    'booking' => [
                        'id' => $guestList->id,
                        'guest_count' => $guestList->total_guests,
                        'local_tourists' => $guestList->local_tourists ?? 0,
                        'foreign_tourists' => $guestList->foreign_tourists ?? 0,
                        'visit_date' => $guestList->visit_date,
                        'status' => $guestList->status,
                    ],
                ], 422);
            }

            // Get guest names and guide info
            $guestNames = $guestList->guest_names ?? [];
            $firstGuestName = is_array($guestNames) && count($guestNames) > 0 
                ? $guestNames[0] 
                : 'Guest Group';

            // Get service and guide info if available
            $service = $guestList->service;
            $operator = $guestList->operator;

            return response()->json([
                'success' => true,
                'message' => 'Booking is valid',
                'booking' => [
                    'id' => $guestList->id,
                    'booking_code' => $guestList->id,
                    'guest_count' => $guestList->total_guests,
                    'local_tourists' => $guestList->local_tourists ?? 0,
                    'foreign_tourists' => $guestList->foreign_tourists ?? 0,
                    'visit_date' => $guestList->visit_date->format('Y-m-d'),
                    'status' => $guestList->status,
                    'first_guest_name' => $firstGuestName,
                    'operator_name' => $operator->name ?? 'Unknown Operator',
                    'service_name' => $service ? $service->service_name : 'Unknown Service',
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error validating booking: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Validate guest list details
     */
    private function validateGuestList($guestList)
    {
        // Check if visit date is today or in the future (within reasonable range)
        $visitDate = $guestList->visit_date;
        $today = Carbon::today();
        $validDate = $visitDate && ($visitDate->isToday() || $visitDate->isFuture());
        
        // Check if status indicates a valid booking (allow various status values)
        $status = strtolower($guestList->status);
        $validStatus = in_array($status, ['approved', 'pending', 'pending entrance', 'arrived']);
        
        $validation = [
            'validDate' => $validDate,
            'approvedStatus' => $validStatus,
            'hasGuests' => $guestList->total_guests > 0,
        ];

        $validation['allValid'] = $validation['validDate'] && $validation['approvedStatus'] && $validation['hasGuests'];
        $validation['issues'] = [];

        if (!$validation['validDate']) {
            $validation['issues'][] = '⚠️ Invalid visit date - booking is for ' . $guestList->visit_date->format('Y-m-d');
        }
        if (!$validation['approvedStatus']) {
            $validation['issues'][] = '⚠️ Booking status is ' . $guestList->status . ' - cannot process arrival';
        }
        if (!$validation['hasGuests']) {
            $validation['issues'][] = '⚠️ No guests registered for this booking';
        }

        return $validation;
    }

    /**
     * Log an arrival
     */
    public function logArrival(Request $request)
    {
        try {
            $request->validate([
                'guest_list_id' => 'required|exists:guest_lists,id',
                'guest_name' => 'required|string',
                'guide_id' => 'nullable|exists:guides,id',
                'arrival_time' => 'nullable|date_format:H:i',
            ]);

            $arrivalLog = ArrivalLog::create([
                'guest_list_id' => $request->input('guest_list_id'),
                'guest_name' => $request->input('guest_name'),
                'guide_id' => $request->input('guide_id'),
                'arrival_time' => $request->input('arrival_time') ?? now()->format('H:i'),
                'arrival_date' => now()->toDateString(),
                'status' => 'arrived',
            ]);

            // Update the guest list status to indicate arrival logged
            $guestList = GuestList::find($request->input('guest_list_id'));
            if ($guestList) {
                $guestList->status = 'arrived';
                $guestList->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Arrival logged successfully',
                'arrival_log' => $arrivalLog,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error logging arrival: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Deny an arrival
     */
    public function denyArrival(Request $request)
    {
        try {
            $request->validate([
                'guest_list_id' => 'required|exists:guest_lists,id',
                'guest_name' => 'required|string',
                'guide_id' => 'nullable|exists:guides,id',
            ]);

            $arrivalLog = ArrivalLog::create([
                'guest_list_id' => $request->input('guest_list_id'),
                'guest_name' => $request->input('guest_name'),
                'guide_id' => $request->input('guide_id'),
                'arrival_time' => now()->format('H:i'),
                'arrival_date' => now()->toDateString(),
                'status' => 'denied',
            ]);

            // Update the guest list status
            $guestList = GuestList::find($request->input('guest_list_id'));
            if ($guestList) {
                $guestList->status = 'denied';
                $guestList->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Arrival denied',
                'arrival_log' => $arrivalLog,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error denying arrival: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all arrival logs for today
     */
    public function getTodayArrivals()
    {
        try {
            $arrivals = ArrivalLog::whereDate('arrival_date', today())
                ->with(['guestList', 'guide'])
                ->orderBy('arrival_time', 'desc')
                ->get()
                ->map(function ($arrival) {
                    return [
                        'id' => $arrival->log_id,
                        'guest_list_id' => $arrival->guest_list_id,
                        'guest_name' => $arrival->guest_name,
                        'guide_id' => $arrival->guide_id,
                        'guide_name' => $arrival->guide?->name ?? 'N/A',
                        'arrival_time' => $arrival->arrival_time->format('H:i'),
                        'arrival_date' => $arrival->arrival_date->format('Y-m-d'),
                        'status' => $arrival->status,
                        'guest_count' => $arrival->guestList?->total_guests ?? 0,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $arrivals,
                'count' => $arrivals->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching arrivals: ' . $e->getMessage(),
            ], 500);
        }
    }
}
