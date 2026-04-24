<?php

namespace App\Http\Controllers;

use App\Models\ArrivalLog;
use App\Models\GuestList;
use App\Models\GuestListQRCode;
use App\Models\Guide;
use App\Models\Attraction;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Services\NotificationService;
use App\Services\SafetyAlertEngine;
use App\Services\EmergencyAlertService;

class StaffArrivalidateController extends Controller
{
    /**
     * Validate a booking code against the guest_lists table or tour QR codes
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

            // First, try to find by QR code token (tour codes like TR-BDN-2026-0019)
            $qrCode = GuestListQRCode::where('token', $bookingCode)->first();
            
            if ($qrCode) {
                // Found a QR code, get the associated guest list
                $guestList = GuestList::find($qrCode->guest_list_id);
                
                if (!$guestList) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Associated guest list not found',
                        'issues' => ['❌ Guest list data not found for this QR code'],
                    ], 404);
                }
            } else {
                // If no QR code found, try searching in guest_lists directly
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
     * Log an arrival from a scanned QR code
     * Updates QR code status, checks if all scanned, updates guest_list status, creates arrival_log
     */
    public function logArrival(Request $request)
    {
        try {
            $request->validate([
                'qr_token' => 'required|string|exists:guest_list_qr_codes,token',
                'guest_name' => 'required|string',
                'guide_id' => 'nullable|exists:guides,id',
                'arrival_time' => 'nullable|date_format:H:i',
            ]);

            return DB::transaction(function () use ($request) {
                // Step 1: Get the QR code and mark it as used
                $qrCode = GuestListQRCode::where('token', $request->input('qr_token'))->first();
                
                if (!$qrCode) {
                    return response()->json([
                        'success' => false,
                        'message' => 'QR code not found',
                    ], 404);
                }

                // Update QR code status to Used
                $qrCode->status = 'Used';
                $qrCode->used_at = now();
                $qrCode->save();

                // Step 2: Get the guest list
                $guestList = GuestList::find($qrCode->guest_list_id);
                
                if (!$guestList) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Guest list not found',
                    ], 404);
                }

                // Step 3: Check if all QR codes for this guest list are now used
                $totalQRCodes = GuestListQRCode::where('guest_list_id', $guestList->id)->count();
                $usedQRCodes = GuestListQRCode::where('guest_list_id', $guestList->id)
                    ->where('status', 'Used')
                    ->count();

                // If all QR codes are scanned, mark guest_list as Completed
                if ($totalQRCodes === $usedQRCodes) {
                    $guestList->status = 'Completed';
                }

                $guestList->save();

                // Step 4: Create arrival log entry
                $arrivalLog = ArrivalLog::create([
                    'guest_list_id' => $guestList->id,
                    'guest_name' => $request->input('guest_name'),
                    'guide_id' => $request->input('guide_id'),
                    'arrival_time' => $request->input('arrival_time') ?? now()->format('H:i:s'),
                    'arrival_date' => now()->toDateString(),
                    'status' => 'arrived',
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Arrival logged successfully',
                    'data' => [
                        'arrival_log_id' => $arrivalLog->log_id,
                        'guest_list_id' => $guestList->id,
                        'guest_name' => $arrivalLog->guest_name,
                        'arrival_time' => $arrivalLog->arrival_time,
                        'arrival_date' => $arrivalLog->arrival_date,
                        'all_guests_arrived' => $totalQRCodes === $usedQRCodes,
                        'guests_arrived_count' => $usedQRCodes,
                        'total_guests' => $totalQRCodes,
                        'qr_code' => $qrCode->token,
                    ],
                ]);
            });
        } catch (\Exception $e) {
            \Log::error('logArrival error: ' . $e->getMessage());
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
                    // Handle arrival_time as string (TIME column)
                    $arrivalTime = is_string($arrival->arrival_time) 
                        ? $arrival->arrival_time 
                        : $arrival->arrival_time?->format('H:i');
                    
                    // Handle arrival_date
                    $arrivalDate = is_string($arrival->arrival_date)
                        ? $arrival->arrival_date
                        : $arrival->arrival_date?->format('Y-m-d');
                    
                    return [
                        'id' => $arrival->log_id,
                        'guest_list_id' => $arrival->guest_list_id,
                        'guest_name' => $arrival->guest_name,
                        'guide_id' => $arrival->guide_id,
                        'guide_name' => $arrival->guide?->full_name ?? $arrival->guide?->name ?? 'N/A',
                        'arrival_time' => $arrivalTime,
                        'arrival_date' => $arrivalDate,
                        'status' => $arrival->status,
                        'guest_count' => $arrival->guestList?->total_guests ?? 0,
                        'is_walk_in' => $arrival->guestList?->notes === 'walk-in',
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $arrivals,
                'count' => $arrivals->count(),
            ]);
        } catch (\Exception $e) {
            \Log::error('getTodayArrivals error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching arrivals: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Log a walk-in tourist (no pre-existing booking/QR)
     * Creates GuestList, QR code, and ArrivalLog in one transaction
     * 
     * Request body:
     * - guest_name (required)
     * - guest_count (required) 
     * - service_id (required)
     * - guide_id (optional)
     * - local_tourists (optional, defaults to guest_count)
     * - foreign_tourists (optional, defaults to 0)
     */
    public function logWalkInWithQR(Request $request)
    {
        try {
            $validated = $request->validate([
                'guest_name' => 'nullable|string|max:255',
                'guest_names' => 'nullable|array',
                'guest_names.*' => 'nullable|string|max:255',
                'guest_count' => 'required|integer|min:1|max:500',
                'service_id' => 'required|integer|exists:attractions,id',
                'guide_id' => 'nullable|integer|exists:guides,id',
                'local_tourists' => 'nullable|integer|min:0',
                'foreign_tourists' => 'nullable|integer|min:0',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Walk-in validation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Validation error: ' . $e->getMessage(),
            ], 400);
        }

        try {
            return DB::transaction(function () use ($validated) {
                $guestCount = $validated['guest_count'];
                $localTourists = $validated['local_tourists'] ?? $guestCount;
                $foreignTourists = $validated['foreign_tourists'] ?? 0;
                $guestNames = collect($validated['guest_names'] ?? [])
                    ->map(fn ($name) => trim((string) $name))
                    ->filter()
                    ->values()
                    ->all();

                if (count($guestNames) !== $guestCount) {
                    if (!empty($validated['guest_name'])) {
                        $guestNames = array_pad([$validated['guest_name']], $guestCount, 'Walk-in Guest');
                    } else {
                        return response()->json([
                            'success' => false,
                            'message' => "Please provide exactly {$guestCount} guest names.",
                        ], 422);
                    }
                }

                // Validate tourist counts
                if (($localTourists + $foreignTourists) != $guestCount) {
                    // Auto-balance if not provided
                    $localTourists = $guestCount;
                    $foreignTourists = 0;
                }

                // Step 1: Get the attraction
                $attraction = Attraction::find($validated['service_id']);
                if (!$attraction) {
                    abort(404, 'Attraction not found');
                }

                // Step 2: Create GuestList for walk-in
                $guestList = GuestList::create([
                    'service_id' => null,  // Walk-in has no service (operator-specific)
                    'attraction_id' => $validated['service_id'],  // Store attraction instead
                    'operator_id' => null,  // Walk-in has no operator
                    'visit_date' => now()->toDateString(),
                    'total_guests' => $guestCount,
                    'local_tourists' => $localTourists,
                    'foreign_tourists' => $foreignTourists,
                    'status' => 'Pending Entrance',
                    'notes' => 'walk-in',  // Flag for walk-in identification
                    'guest_names' => $guestNames,
                ]);

                // Step 3: Generate one unique QR code per guest
                $qrTokens = [];
                foreach ($guestNames as $index => $name) {
                    $qrToken = 'WALK-' . now()->format('YmdHis') . '-' . str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT) . '-' . Str::upper(Str::random(4));
                    $qrTokens[] = $qrToken;

                    GuestListQRCode::create([
                        'guest_list_id' => $guestList->id,
                        'guest_index' => $index,
                        'token' => $qrToken,
                        'status' => 'Used',  // Already used since walk-in is immediate arrival
                        'expiration_date' => null,
                        'used_at' => now(),
                    ]);
                }

                // Step 4: Get entry fee from attraction
                $entryFee = $attraction->entry_fee ?? 0;
                $arrivalLogs = [];
                foreach ($guestNames as $name) {
                    $arrivalLogs[] = ArrivalLog::create([
                        'guest_list_id' => $guestList->id,
                        'guest_name' => $name,
                        'guide_id' => $validated['guide_id'] ?? null,
                        'arrival_time' => now()->format('H:i:s'),
                        'arrival_date' => now()->toDateString(),
                        'fee_paid' => $entryFee,
                        'status' => 'arrived',
                    ]);
                }

                // Step 5: Notify about arrival (optional - catch errors)
                try {
                    $guideName = null;
                    if ($validated['guide_id']) {
                        $guide = Guide::find($validated['guide_id']);
                        $guideName = $guide->full_name ?? $guide->name ?? 'Unknown Guide';
                    }

                    if (class_exists('App\Services\NotificationService')) {
                        NotificationService::arrivalLogged(
                            $guestNames[0],
                            $guestCount,
                            $guideName ?? 'Walk-in (No Guide)',
                            $arrivalLogs[0]->log_id
                        );
                    }
                } catch (\Exception $notifyError) {
                    \Log::warning('Notification service error (non-critical): ' . $notifyError->getMessage());
                }

                // Step 6: Run safety checks (optional - catch errors)
                try {
                    if (class_exists('App\Services\SafetyAlertEngine')) {
                        $alertEngine = new SafetyAlertEngine();
                        $alertEngine->checkAllConditions();
                    }
                } catch (\Exception $safetyError) {
                    \Log::warning('Safety alert error (non-critical): ' . $safetyError->getMessage());
                }

                // Step 7: Run emergency checks (optional - catch errors)
                try {
                    if (class_exists('App\Services\EmergencyAlertService')) {
                        $emergencyService = new EmergencyAlertService();
                        $emergencyService->checkCapacityEmergency();
                        if ($validated['guide_id']) {
                            $emergencyService->checkMissingGuideEmergency($guestList);
                        }
                    }
                } catch (\Exception $emergencyError) {
                    \Log::warning('Emergency alert error (non-critical): ' . $emergencyError->getMessage());
                }

                return response()->json([
                    'success' => true,
                    'message' => '✅ Walk-in arrival logged successfully!',
                    'code' => 'WALK_IN_SUCCESS',
                    'data' => [
                        'arrival_log_ids' => collect($arrivalLogs)->pluck('log_id')->values()->all(),
                        'guest_list_id' => $guestList->id,
                        'guest_name' => $guestNames[0],
                        'guest_names' => $guestNames,
                        'guide_name' => $guideName ?? 'None',
                        'arrival_time' => $arrivalLogs[0]->arrival_time,
                        'arrival_date' => $arrivalLogs[0]->arrival_date,
                        'total_guests' => $guestCount,
                        'qr_token' => $qrTokens[0] ?? null,
                        'qr_tokens' => $qrTokens,
                        'service_name' => $attraction->name ?? 'Unknown Attraction',
                        'fee_paid' => $guestCount * $entryFee,
                        'is_walk_in' => true,
                    ],
                ], 201);
            });
        } catch (\Exception $e) {
            \Log::error('Walk-in logging error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error logging walk-in arrival: ' . $e->getMessage(),
                'code' => 'WALK_IN_ERROR',
            ], 500);
        }
    }
}
