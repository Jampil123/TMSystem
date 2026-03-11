<?php

namespace App\Http\Controllers;

use App\Models\ArrivalLog;
use App\Models\GuestList;
use App\Models\GuestListQRCode;
use App\Models\GuideAssignment;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class QRCodeArrivalController extends Controller
{
    /**
     * Process QR code scan and log arrival
     * 
     * Flow:
     * 1. Validate QR token from guest_lists_qr_codes table
     * 2. Get guest_list_id from QR code record
     * 3. Verify QR code is active/not expired/not already used
     * 4. Get assigned guide from guide_assignments table
     * 5. Check if assignment is confirmed
     * 6. Insert arrival log
     * 7. Update QR code status to "used"
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
                    return response()->json([
                        'success' => false,
                        'message' => '❌ QR code not found in system',
                        'code' => 'QR_NOT_FOUND',
                    ], 404);
                }

                // Step 3: Verify QR code status
                if (strtolower($qrCode->status) === 'used') {
                    return response()->json([
                        'success' => false,
                        'message' => '⚠️ This QR code has already been used. Duplicate entry blocked.',
                        'code' => 'QR_ALREADY_USED',
                    ], 422);
                }

                if (strtolower($qrCode->status) === 'expired') {
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

                // Step 4: Get assigned guide
                $guideAssignment = GuideAssignment::where('guest_list_id', $guestList->id)
                    ->with('guide')
                    ->first();

                if (!$guideAssignment) {
                    return response()->json([
                        'success' => false,
                        'message' => '⚠️ No guide assigned to this guest list yet',
                        'code' => 'NO_GUIDE_ASSIGNED',
                    ], 422);
                }

                // Step 5: Check if assignment is confirmed
                if ($guideAssignment->assignment_status !== 'Confirmed') {
                    return response()->json([
                        'success' => false,
                        'message' => '⚠️ Guide assignment is not confirmed. Status: ' . $guideAssignment->assignment_status,
                        'code' => 'ASSIGNMENT_NOT_CONFIRMED',
                    ], 422);
                }

                // Step 6: Create arrival log
                $arrivalLog = ArrivalLog::create([
                    'guest_list_id' => $guestList->id,
                    'guest_name' => $guestList->guest_names[0] ?? 'Guest Group',
                    'guide_id' => $guideAssignment->guide_id,
                    'arrival_time' => now()->format('H:i:s'),
                    'arrival_date' => now()->toDateString(),
                    'status' => 'arrived',
                ]);

                // Step 7: Update QR code status to "used"
                $qrCode->status = 'Used';
                $qrCode->used_at = now();
                $qrCode->save();

                // Step 8: Update guide assignment status when all guests arrive
                // Count how many QRs are still unused after marking this one as used
                $unusedCount = GuestListQRCode::where('guest_list_id', $guestList->id)
                    ->whereNotIn('status', ['Used', 'Expired'])
                    ->count();

                if ($unusedCount === 0) {
                    // All guests have arrived - mark assignment as completed
                    $guestList->status = 'Arrived';
                    $guestList->save();

                    // Mark guide assignment as 'Completed' when all guests arrive
                    $guideAssignment->assignment_status = 'Completed';
                    $guideAssignment->save();
                }

                return response()->json([
                    'success' => true,
                    'message' => '✅ Arrival logged successfully!',
                    'code' => 'SUCCESS',
                    'data' => [
                        'arrival_log_id' => $arrivalLog->id,
                        'guest_list_id' => $guestList->id,
                        'guest_name' => $arrivalLog->guest_name,
                        'guide_name' => $guideAssignment->guide->full_name ?? 'Unknown Guide',
                        'arrival_time' => $arrivalLog->arrival_time,
                        'arrival_date' => $arrivalLog->arrival_date,
                        'total_guests' => $guestList->total_guests,
                        'service_name' => $guestList->service->service_name ?? 'Unknown Service',
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

            $totalGuests = ArrivalLog::whereDate('arrival_date', $today)
                ->where('status', 'arrived')
                ->join('guest_lists', 'arrival_logs.guest_list_id', '=', 'guest_lists.id')
                ->sum('guest_lists.total_guests');

            return response()->json([
                'success' => true,
                'data' => [
                    'total_arrivals' => $totalArrivals,
                    'verified_arrivals' => $verifiedArrivals,
                    'denied_arrivals' => $deniedArrivals,
                    'total_guests' => $totalGuests ?? 0,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching statistics: ' . $e->getMessage(),
            ], 500);
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
                ->with(['guestList', 'guide'])
                ->orderBy('arrival_time', 'desc')
                ->limit(20)
                ->get()
                ->map(function ($arrival) {
                    return [
                        'id' => $arrival->log_id,
                        'guest_list_id' => $arrival->guest_list_id,
                        'guest_name' => $arrival->guest_name,
                        'guide_name' => $arrival->guide?->full_name ?? 'N/A',
                        'arrival_time' => $arrival->arrival_time->format('H:i'),
                        'arrival_date' => $arrival->arrival_date->format('Y-m-d'),
                        'status' => $arrival->status,
                        'total_guests' => $arrival->guestList?->total_guests ?? 0,
                        'service_name' => $arrival->guestList?->service?->service_name ?? 'Unknown Service',
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $arrivals,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching arrivals: ' . $e->getMessage(),
            ], 500);
        }
    }
}
