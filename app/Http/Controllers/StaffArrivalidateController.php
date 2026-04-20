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

                // Step 4: Get the attraction and its entry fee
                $attraction = Attraction::find($guestList->attraction_id);
                $entryFee = $attraction ? $attraction->entry_fee : 0;

                // Step 5: Create arrival log entry with fee_paid from attraction
                $arrivalLog = ArrivalLog::create([
                    'guest_list_id' => $guestList->id,
                    'guest_name' => $request->input('guest_name'),
                    'guide_id' => $request->input('guide_id'),
                    'arrival_time' => $request->input('arrival_time') ?? now()->format('H:i:s'),
                    'arrival_date' => now()->toDateString(),
                    'fee_paid' => $entryFee,
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
                        'fee_paid' => $arrivalLog->fee_paid,
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
     * Log departure when tourist exits the spot
     */
    public function logDeparture(Request $request)
    {
        try {
            $request->validate([
                'qr_token' => 'required|string|exists:guest_list_qr_codes,token',
                'departure_time' => 'nullable|date_format:H:i',
            ]);

            return DB::transaction(function () use ($request) {
                // Step 1: Get the QR code
                $qrCode = GuestListQRCode::where('token', $request->input('qr_token'))->first();
                
                if (!$qrCode) {
                    return response()->json([
                        'success' => false,
                        'message' => 'QR code not found',
                    ], 404);
                }

                // Step 2: Get the guest list and find the arrival log
                $guestList = GuestList::find($qrCode->guest_list_id);
                
                if (!$guestList) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Guest list not found',
                    ], 404);
                }

                // Step 3: Find the arrival log for this guest (most recent with 'arrived' status)
                $arrivalLog = ArrivalLog::where('guest_list_id', $guestList->id)
                    ->where('status', 'arrived')
                    ->orderBy('created_at', 'desc')
                    ->first();

                if (!$arrivalLog) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No active arrival log found for this guest',
                    ], 404);
                }

                // Step 4: Update arrival log with departure info
                $arrivalLog->departure_time = $request->input('departure_time') ?? now()->format('H:i:s');
                $arrivalLog->status = 'departed';
                $arrivalLog->save();

                return response()->json([
                    'success' => true,
                    'message' => 'Departure logged successfully',
                    'data' => [
                        'arrival_log_id' => $arrivalLog->log_id,
                        'guest_list_id' => $guestList->id,
                        'guest_name' => $arrivalLog->guest_name,
                        'arrival_time' => $arrivalLog->arrival_time,
                        'departure_time' => $arrivalLog->departure_time,
                        'arrival_date' => $arrivalLog->arrival_date,
                        'fee_paid' => $arrivalLog->fee_paid,
                        'status' => $arrivalLog->status,
                        'qr_code' => $qrCode->token,
                    ],
                ]);
            });
        } catch (\Exception $e) {
            \Log::error('logDeparture error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error logging departure: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle guest status - handles both entry and exit
     * First scan = entry, Second scan = exit
     */
    public function toggleGuestStatus(Request $request)
    {
        try {
            $request->validate([
                'qr_token' => 'required|string|exists:guest_list_qr_codes,token',
            ]);

            return DB::transaction(function () use ($request) {
                $qrToken = $request->input('qr_token');

                // Step 1: Validate QR code exists and get associated guest list
                $qrCode = GuestListQRCode::where('token', $qrToken)->first();
                
                if (!$qrCode) {
                    return response()->json([
                        'success' => false,
                        'message' => 'QR code not found',
                    ], 404);
                }

                // Check if QR code is expired
                if ($qrCode->expiration_date && now()->isAfter($qrCode->expiration_date)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'QR code has expired',
                    ], 410);
                }

                // Step 2: Get the guest list
                $guestList = GuestList::find($qrCode->guest_list_id);
                
                if (!$guestList) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Guest list not found',
                    ], 404);
                }

                // Get the correct guest name based on guest_index from QR code
                $guestNames = $guestList->guest_names ?? [];
                $guestIndex = $qrCode->guest_index ?? 0;
                
                // Get the guest name for this specific QR code
                $guestName = (is_array($guestNames) && isset($guestNames[$guestIndex])) 
                    ? $guestNames[$guestIndex] 
                    : (count($guestNames) > 0 ? $guestNames[0] : 'Guest ' . $guestList->id);

                // Step 3: Get the attraction and its entry fee
                $attraction = Attraction::find($guestList->attraction_id);
                $entryFee = $attraction ? $attraction->entry_fee : 0;

                // Step 4: Check if THIS SPECIFIC GUEST has records today (by guest_name from guest_index)
                $todayRecords = ArrivalLog::where('guest_list_id', $guestList->id)
                    ->where('guest_name', $guestName)
                    ->whereDate('arrival_date', today())
                    ->first();

                // Check for active "arrived" record for THIS SPECIFIC GUEST
                $activeArrival = ArrivalLog::where('guest_list_id', $guestList->id)
                    ->where('guest_name', $guestName)
                    ->where('status', 'arrived')
                    ->whereDate('arrival_date', today())
                    ->first();

                // Check for already "departed" record for THIS SPECIFIC GUEST
                $departedRecord = ArrivalLog::where('guest_list_id', $guestList->id)
                    ->where('guest_name', $guestName)
                    ->where('status', 'departed')
                    ->whereDate('arrival_date', today())
                    ->first();

                // Step 5: Handle entry or exit
                if ($departedRecord) {
                    // DUPLICATE DEPARTURE: Guest already exited today
                    return response()->json([
                        'success' => false,
                        'message' => 'Guest has already departed today',
                        'data' => [
                            'guest_name' => $departedRecord->guest_name,
                            'departure_time' => $departedRecord->departure_time,
                            'status' => 'departed',
                        ],
                    ], 400);
                } elseif ($activeArrival) {
                    // EXIT: Update existing arrival log to departure
                    $activeArrival->departure_time = now()->format('H:i:s');
                    $activeArrival->status = 'departed';
                    $activeArrival->save();

                    // Mark QR code as Used on exit as well
                    $qrCode->status = 'Used';
                    $qrCode->used_at = now();
                    $qrCode->save();

                    // Check if all guests have departed
                    $totalGuests = $guestList->total_guests;
                    $departedGuests = ArrivalLog::where('guest_list_id', $guestList->id)
                        ->where('status', 'departed')
                        ->whereDate('arrival_date', today())
                        ->count();

                    // If all guests have departed, mark guest list as completed
                    if ($departedGuests >= $totalGuests) {
                        $guestList->status = 'Completed';
                        $guestList->save();
                    }

                    return response()->json([
                        'success' => true,
                        'action' => 'exit',
                        'message' => 'Guest exit recorded',
                        'data' => [
                            'arrival_log_id' => $activeArrival->log_id,
                            'guest_list_id' => $guestList->id,
                            'guest_name' => $activeArrival->guest_name,
                            'arrival_time' => $activeArrival->arrival_time,
                            'departure_time' => $activeArrival->departure_time,
                            'arrival_date' => $activeArrival->arrival_date,
                            'fee_paid' => $activeArrival->fee_paid,
                            'status' => $activeArrival->status,
                            'qr_code' => $qrToken,
                            'total_guests' => $guestList->total_guests,
                            'guest_list_status' => $guestList->status,
                        ],
                    ]);
                } else {
                    // ENTRY: Create new arrival log
                    $arrivalLog = ArrivalLog::create([
                        'guest_list_id' => $guestList->id,
                        'guest_name' => $guestName,
                        'guide_id' => null,
                        'arrival_time' => now()->format('H:i:s'),
                        'arrival_date' => now()->toDateString(),
                        'departure_time' => null,
                        'fee_paid' => $entryFee, // Charge fee on entry only
                        'status' => 'arrived',
                    ]);

                    // Set guest list status to Active on first guest arrival
                    if ($guestList->status === 'Pending Entrance') {
                        $guestList->status = 'Active';
                        $guestList->save();
                    }

                    // Update QR code status to Used
                    $qrCode->status = 'Used';
                    $qrCode->used_at = now();
                    $qrCode->save();

                    return response()->json([
                        'success' => true,
                        'action' => 'entry',
                        'message' => 'Guest entry recorded',
                        'data' => [
                            'arrival_log_id' => $arrivalLog->log_id,
                            'guest_list_id' => $guestList->id,
                            'guest_name' => $arrivalLog->guest_name,
                            'arrival_time' => $arrivalLog->arrival_time,
                            'arrival_date' => $arrivalLog->arrival_date,
                            'fee_paid' => $arrivalLog->fee_paid,
                            'status' => $arrivalLog->status,
                            'qr_code' => $qrToken,
                            'total_guests' => $guestList->total_guests,
                            'guest_list_status' => $guestList->status,
                        ],
                    ]);
                }
            });
        } catch (\Exception $e) {
            \Log::error('toggleGuestStatus error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error processing QR code: ' . $e->getMessage(),
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
                'guest_name' => 'required|string|max:255',
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
                    'status' => 'Completed',  // Walk-in is immediate arrival
                    'notes' => 'walk-in',  // Flag for walk-in identification
                    'guest_names' => [$validated['guest_name']],
                ]);

                // Step 3: Generate unique QR code for walk-in
                $qrToken = 'WALK-' . now()->format('YmdHis') . '-' . Str::upper(Str::random(6));
                
                $qrCode = GuestListQRCode::create([
                    'guest_list_id' => $guestList->id,
                    'token' => $qrToken,
                    'status' => 'Used',  // Already used since walk-in is immediate arrival
                    'expiration_date' => null,
                    'used_at' => now(),
                ]);

                // Step 4: Get entry fee from attraction
                $entryFee = $attraction->entry_fee ?? 0;
                $arrivalLog = ArrivalLog::create([
                    'guest_list_id' => $guestList->id,
                    'guest_name' => $validated['guest_name'],
                    'guide_id' => $validated['guide_id'] ?? null,
                    'arrival_time' => now()->format('H:i:s'),
                    'arrival_date' => now()->toDateString(),
                    'fee_paid' => $guestCount * $entryFee,
                    'status' => 'arrived',
                ]);

                // Step 5: Notify about arrival (optional - catch errors)
                try {
                    $guideName = null;
                    if ($validated['guide_id']) {
                        $guide = Guide::find($validated['guide_id']);
                        $guideName = $guide->full_name ?? $guide->name ?? 'Unknown Guide';
                    }

                    if (class_exists('App\Services\NotificationService')) {
                        NotificationService::arrivalLogged(
                            $validated['guest_name'],
                            $guestCount,
                            $guideName ?? 'Walk-in (No Guide)',
                            $arrivalLog->log_id
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
                        'arrival_log_id' => $arrivalLog->log_id,
                        'guest_list_id' => $guestList->id,
                        'guest_name' => $validated['guest_name'],
                        'guide_name' => $guideName ?? 'None',
                        'arrival_time' => $arrivalLog->arrival_time,
                        'arrival_date' => $arrivalLog->arrival_date,
                        'total_guests' => $guestCount,
                        'qr_token' => $qrToken,
                        'service_name' => $attraction->name ?? 'Unknown Attraction',
                        'fee_paid' => $arrivalLog->fee_paid,
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
