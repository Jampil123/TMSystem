<?php

namespace App\Http\Controllers;

use App\Models\ArrivalLog;
use App\Models\GuestList;
use App\Models\GuestListQRCode;
use App\Models\GuideAssignment;
use App\Services\NotificationService;
use App\Services\SafetyAlertEngine;
use App\Services\EmergencyAlertService;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class QRCodeArrivalController extends Controller
{
    /**
     * Verify guide presence and assignment status
     * 
     * @param int $guestListId
     * @return array|null Returns guide assignment if valid, null if not
     */
    private function verifyGuidePresence($guestListId)
    {
        $guideAssignment = GuideAssignment::where('guest_list_id', $guestListId)
            ->with('guide')
            ->first();

        // Check if guide assignment exists
        if (!$guideAssignment) {
            return null;
        }

        // Check if assignment is confirmed
        if ($guideAssignment->assignment_status !== 'Confirmed') {
            return null;
        }

        return $guideAssignment;
    }

    /**
     * Check guide assignment status before QR scan
     * Allows entrance staff to verify guide presence before scanning
     */
    public function checkGuidePresence(Request $request)
    {
        $validated = $request->validate([
            'guest_list_id' => 'required|integer|exists:guest_lists,id',
        ]);

        try {
            $guestList = GuestList::find($validated['guest_list_id']);
            
            if (!$guestList) {
                return response()->json([
                    'success' => false,
                    'message' => 'Guest list not found',
                    'code' => 'GUEST_LIST_NOT_FOUND',
                ], 404);
            }

            $guideAssignment = $this->verifyGuidePresence($guestList->id);

            if (!$guideAssignment) {
                NotificationService::guideVerificationFailed($guestList->id, 'Guide not confirmed or not present');
                return response()->json([
                    'success' => false,
                    'message' => 'Entry denied. No confirmed guide assigned for this guest group.',
                    'code' => 'GUIDE_NOT_CONFIRMED',
                    'guide_present' => false,
                ], 403);
            }

            return response()->json([
                'success' => true,
                'message' => '✅ Confirmed guide is assigned for this group',
                'code' => 'GUIDE_VERIFIED',
                'guide_present' => true,
                'data' => [
                    'guest_list_id' => $guestList->id,
                    'guest_count' => $guestList->total_guests,
                    'guide_name' => $guideAssignment->guide->full_name,
                    'guide_id' => $guideAssignment->guide->id,
                    'assignment_status' => $guideAssignment->assignment_status,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking guide presence: ' . $e->getMessage(),
                'code' => 'ERROR',
            ], 500);
        }
    }

    /**
     * Process QR code scan and log arrival
     * 
     * Flow:
     * 1. Validate QR token from guest_lists_qr_codes table
     * 2. Get guest_list_id from QR code record
     * 3. Verify QR code is active/not expired/not already used
     * 4. Verify guide presence (GUIDE PRESENCE VERIFICATION STEP)
     * 5. Create arrival log
     * 6. Update QR code status to "used"
     * 7. Update guide assignment status if all guests have arrived
     */
    public function processQRCode(Request $request)
    {
        $validated = $request->validate([
            'qr_token' => 'required|string',
        ]);

        return DB::transaction(function () use ($validated) {
            try {
                $token = trim($validated['qr_token']);
                
                // Step 1 & 2: Find QR code and get guest_list_id
                $qrCode = GuestListQRCode::where('token', $token)->first();

                if (!$qrCode) {
                    NotificationService::invalidQR($token);
                    return response()->json([
                        'success' => false,
                        'message' => '❌ QR code not found in system',
                        'code' => 'QR_NOT_FOUND',
                    ], 404);
                }

                // Step 3: Verify QR code status
                if (strtolower($qrCode->status) === 'used') {
                    NotificationService::qrAlreadyUsed($token);
                    return response()->json([
                        'success' => false,
                        'message' => '⚠️ This QR code has already been used. Duplicate entry blocked.',
                        'code' => 'QR_ALREADY_USED',
                    ], 422);
                }

                if (strtolower($qrCode->status) === 'expired') {
                    NotificationService::qrExpired($token);
                    return response()->json([
                        'success' => false,
                        'message' => '❌ This QR code has expired',
                        'code' => 'QR_EXPIRED',
                    ], 422);
                }

                // Check expiration date
                if ($qrCode->expiration_date && $qrCode->expiration_date->isPast()) {
                    $qrCode->status = 'Expired';
                    $qrCode->save();

                    NotificationService::qrExpired($token);
                    return response()->json([
                        'success' => false,
                        'message' => '❌ This QR code has expired',
                        'code' => 'QR_EXPIRED',
                    ], 422);
                }

                // Get guest list
                $guestList = $qrCode->guestList;
                if (!$guestList) {
                    return response()->json([
                        'success' => false,
                        'message' => '❌ Guest list not found',
                        'code' => 'GUEST_LIST_NOT_FOUND',
                    ], 404);
                }

                // Step 4: GUIDE PRESENCE VERIFICATION
                // Verify that a confirmed guide is assigned before allowing entry
                $guideAssignment = $this->verifyGuidePresence($guestList->id);

                if (!$guideAssignment) {
                    // Log denied entry for audit purposes
                    \Log::warning('Entry Denied - No Confirmed Guide', [
                        'qr_token' => $token,
                        'guest_list_id' => $guestList->id,
                        'timestamp' => now(),
                        'reason' => 'Guide presence verification failed',
                    ]);

                    NotificationService::guideVerificationFailed($token, 'Guide not confirmed or not present');
                    return response()->json([
                        'success' => false,
                        'message' => 'Entry denied. No confirmed guide assigned for this guest group.',
                        'code' => 'GUIDE_NOT_CONFIRMED',
                        'guide_verified' => false,
                    ], 403);
                }

                // Step 4.5: EMERGENCY CHECK - Block entry if emergency active
                // Check if any emergency is preventing new entries
                $emergencyService = new EmergencyAlertService();
                if ($emergencyService->shouldBlockNewEntry()) {
                    \Log::warning('Entry Denied - Emergency Active', [
                        'qr_token' => $token,
                        'guest_list_id' => $guestList->id,
                        'timestamp' => now(),
                        'reason' => 'Emergency condition preventing new entries',
                    ]);

                    NotificationService::entryBlocked(
                        $guestList->guest_names[0] ?? 'Guest Group',
                        'An emergency situation is preventing new guest entries. Please contact the administrator.'
                    );
                    return response()->json([
                        'success' => false,
                        'message' => '🚨 Entry blocked: Emergency situation in progress. Contact administrator.',
                        'code' => 'EMERGENCY_BLOCK',
                        'guide_verified' => false,
                    ], 403);
                }

                // Step 5: Create arrival log
                // Get entry fee from the attraction associated with the service
                $entryFee = 0;
                if ($guestList->service && $guestList->service->touristSpot) {
                    $entryFee = $guestList->service->touristSpot->entry_fee ?? 0;
                }

                $arrivalLog = ArrivalLog::create([
                    'guest_list_id' => $guestList->id,
                    'guest_name' => $guestList->guest_names[0] ?? 'Guest Group',
                    'guide_id' => $guideAssignment->guide_id,
                    'arrival_time' => now()->format('H:i:s'),
                    'arrival_date' => now()->toDateString(),
                    'fee_paid' => $entryFee,
                    'status' => 'arrived',
                ]);

                // Create notification for successful arrival
                NotificationService::arrivalLogged(
                    $guestList->guest_names[0] ?? 'Guest Group',
                    $guestList->total_guests,
                    $guideAssignment->guide->full_name ?? 'Unknown Guide',
                    $arrivalLog->log_id  // Use log_id instead of id (it's the primary key)
                );

                // Run safety checks for this arrival
                $alertEngine = new SafetyAlertEngine();
                $alertEngine->checkAllConditions();

                // Run emergency checks after successful arrival
                $emergencyService = new EmergencyAlertService();
                $emergencyService->checkCapacityEmergency();
                $emergencyService->checkMissingGuideEmergency($guestList);

                // Step 6: Update QR code status to "used"
                $qrCode->status = 'Used';
                $qrCode->used_at = now();
                $qrCode->save();

                // Step 7: Update guide assignment status when all guests arrive
                // Count how many QRs are still unused after marking this one as used
                $unusedCount = GuestListQRCode::where('guest_list_id', $guestList->id)
                    ->whereNotIn('status', ['Used', 'Expired'])
                    ->count();

                if ($unusedCount === 0) {
                    // All guests have arrived - mark status as Completed
                    $guestList->status = 'Completed';
                    $guestList->save();

                    // Mark guide assignment as 'Completed' when all guests arrive
                    $guideAssignment->assignment_status = 'Completed';
                    $guideAssignment->save();
                }

                return response()->json([
                    'success' => true,
                    'message' => '✅ Arrival logged successfully!',
                    'code' => 'SUCCESS',
                    'guide_verified' => true,
                    'data' => [
                        'arrival_log_id' => $arrivalLog->log_id,  // Use log_id instead of id
                        'guest_list_id' => $guestList->id,
                        'guest_name' => $arrivalLog->guest_name,
                        'guide_name' => $guideAssignment->guide->full_name ?? 'Unknown Guide',
                        'guide_verified' => true,
                        'arrival_time' => $arrivalLog->arrival_time,
                        'arrival_date' => $arrivalLog->arrival_date,
                        'total_guests' => $guestList->total_guests,
                        'service_name' => $guestList->service->service_name ?? 'Unknown Service',
                        'fee_paid' => $arrivalLog->fee_paid,
                    ],
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error processing QR code: ' . $e->getMessage(),
                    'code' => 'ERROR',
                ], 500);
            }
        });
    }

    /**
     * Get arrival statistics for today
     */
    public function getTodayStats()
    {
        try {
            $today = Carbon::today();

            $totalArrivals = ArrivalLog::whereDate('arrival_date', $today)->count();
            $verifiedArrivals = ArrivalLog::whereDate('arrival_date', $today)
                ->where('status', 'arrived')
                ->count();
            $deniedArrivals = ArrivalLog::whereDate('arrival_date', $today)
                ->where('status', 'denied')
                ->count();

            // Get total guests with safer query
            $totalGuests = 0;
            try {
                $totalGuests = ArrivalLog::whereDate('arrival_date', $today)
                    ->where('status', 'arrived')
                    ->with('guestList')
                    ->get()
                    ->sum(function ($arrival) {
                        return $arrival->guestList?->total_guests ?? 0;
                    });
            } catch (\Exception $е) {
                \Log::warning('Error calculating total guests: ' . $е->getMessage());
                $totalGuests = 0;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'total_scans' => $totalArrivals,
                    'successful_arrivals' => $verifiedArrivals,
                    'failed_scans' => $deniedArrivals,
                    'total_guests' => $totalGuests,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching statistics',
                'data' => [
                    'total_scans' => 0,
                    'successful_arrivals' => 0,
                    'failed_scans' => 0,
                    'total_guests' => 0,
                ],
            ], 200); // Return 200 to prevent page reload; error handled gracefully
        }
    }

    /**
     * Get recent arrivals for today
     */
    public function getRecentArrivals()
    {
        try {
            $today = Carbon::today();

            $arrivals = ArrivalLog::whereDate('arrival_date', $today)
                ->with(['guestList.qrCodes', 'guide'])
                ->orderBy('arrival_time', 'desc')
                ->limit(20)
                ->get()
                ->map(function ($arrival) {
                    // Get the QR token from the guest list's QR codes
                    $qrToken = $arrival->guestList?->qrCodes?->first()?->token ?? 'N/A';
                    
                    return [
                        'id' => $arrival->log_id,
                        'guest_list_id' => $arrival->guest_list_id,
                        'qr_token' => $qrToken,
                        'guest_name' => $arrival->guest_name ?? 'Unknown',
                        'guide_name' => $arrival->guide?->full_name ?? 'N/A',
                        'arrival_time' => $arrival->arrival_time ?? 'N/A',
                        'arrival_date' => $arrival->arrival_date ? $arrival->arrival_date->format('Y-m-d') : 'N/A',
                        'created_at' => $arrival->created_at,
                        'status' => $arrival->status ?? 'pending',
                        'total_guests' => $arrival->guestList?->total_guests ?? 0,
                        'service_name' => $arrival->guestList?->service?->service_name ?? 'Unknown Service',
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $arrivals,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching recent arrivals: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'Unable to fetch recent arrivals at this time',
            ], 200); // Return 200 with empty data to prevent errors
        }
    }

    /**
     * Get real-time visitor count and capacity status
     * Returns the current number of visitors inside the site based on arrival_logs
     */
    public function getVisitorCount()
    {
        try {
            $today = Carbon::today();

            // Get current visitor count from arrival_logs
            // Query: SELECT COUNT(*) FROM arrival_logs WHERE status = 'Arrived' AND arrival_date = CURRENT_DATE
            $currentVisitors = ArrivalLog::whereDate('arrival_date', $today)
                ->where('status', 'arrived')
                ->count();

            // Get maximum capacity from configuration
            // Can be set via env variable or hardcoded default
            $maximumCapacity = (int) env('SITE_MAXIMUM_CAPACITY', 350);

            // Calculate capacity percentage
            $capacityPercentage = $maximumCapacity > 0 ? ($currentVisitors / $maximumCapacity) * 100 : 0;

            // Determine capacity status
            $capacityStatus = 'SAFE'; // Default
            if ($capacityPercentage > 90) {
                $capacityStatus = 'CRITICAL';
            } elseif ($capacityPercentage > 70) {
                $capacityStatus = 'WARNING';
            }

            // Calculate remaining capacity
            $remainingCapacity = max(0, $maximumCapacity - $currentVisitors);

            return response()->json([
                'success' => true,
                'data' => [
                    'current_visitors' => $currentVisitors,
                    'maximum_capacity' => $maximumCapacity,
                    'remaining_capacity' => $remainingCapacity,
                    'capacity_percentage' => round($capacityPercentage, 2),
                    'capacity_status' => $capacityStatus, // SAFE, WARNING, CRITICAL
                    'timestamp' => now()->format('H:i:s'),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching visitor count: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching visitor count',
                'data' => [
                    'current_visitors' => 0,
                    'maximum_capacity' => 350,
                    'remaining_capacity' => 350,
                    'capacity_percentage' => 0,
                    'capacity_status' => 'SAFE',
                ],
            ], 200);
        }
    }

    /**
     * Get hourly capacity history for today
     * Returns cumulative visitor counts for each hour
     */
    public function getCapacityHistory()
    {
        try {
            $today = Carbon::today();
            $maximumCapacity = (int) env('SITE_MAXIMUM_CAPACITY', 350);
            
            // Get all arrivals for today, ordered by time
            $arrivals = ArrivalLog::whereDate('arrival_date', $today)
                ->where('status', 'arrived')
                ->get();

            // Build hourly history
            $hourlyData = [];
            $cumulativeCount = 0;

            // Process each hour from 6 AM to 10 PM
            for ($hour = 6; $hour < 22; $hour++) {
                $hourFormatted = sprintf('%02d', $hour);
                $timeStr = $hourFormatted . ':00';

                // Count arrivals up to this hour
                $arrivalsUpToThisHour = $arrivals->filter(function ($arrival) use ($hour) {
                    $arrivalHour = (int) explode(':', $arrival->arrival_time)[0];
                    return $arrivalHour <= $hour && $arrival->arrival_date === Carbon::today()->format('Y-m-d');
                })->count();

                $hourlyData[] = [
                    'time' => $timeStr,
                    'count' => max(0, $arrivalsUpToThisHour),
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $hourlyData,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching capacity history: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'data' => [],
            ], 200); // Return empty array gracefully
        }
    }
}
