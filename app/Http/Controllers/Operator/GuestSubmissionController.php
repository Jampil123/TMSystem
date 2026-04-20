<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\GuestList;
use App\Models\GuestListQRCode;
use App\Models\Guide;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GuestSubmissionController extends Controller
{
    /**
     * Display guest submission form for operator services.
     */
    public function index()
    {
        $user = auth()->user();
        
        // Get all approved services for this operator
        $services = Service::where('operator_id', $user->id)
            ->where('status', 'Approved')
            ->select('service_id', 'service_name', 'service_type', 'tourist_spot_id', 'created_at')
            ->get()
            ->map(function ($service) {
                return [
                    'id' => $service->service_id,
                    'name' => $service->service_name,
                    'type' => $service->service_type,
                    'tourist_spot_id' => $service->tourist_spot_id,
                    'date' => $service->created_at->format('M d, Y'),
                ];
            });

        // Get guest submissions for this operator
        $guestSubmissions = GuestList::where('operator_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'serviceId' => $submission->service_id,
                    'serviceName' => $submission->service->service_name ?? 'Unknown Service',
                    'date' => $submission->visit_date->format('M d, Y'),
                    'guestCount' => $submission->total_guests,
                    'status' => $submission->status,
                    'qrCodeCount' => $submission->qrCodes()->count(),
                ];
            });

        return Inertia::render('operator/guest-submission', [
            'services' => $services,
            'guestSubmissions' => $guestSubmissions,
        ]);
    }

    /**
     * Store guest submission and generate QR codes.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        // Validate request
        $validated = $request->validate([
            'service_id' => 'required|integer',
            'attraction_id' => 'nullable|integer',
            'visit_date' => 'required|date|after:today',
            'total_guests' => 'required|integer|min:1',
            'local_tourists' => 'required|integer|min:0',
            'foreign_tourists' => 'required|integer|min:0',
            'guest_names' => 'nullable|array',
            'guest_names.*' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        // Validate local + foreign equals total
        if ($validated['local_tourists'] + $validated['foreign_tourists'] != $validated['total_guests']) {
            return back()->withErrors([
                'guests' => 'Local tourists + Foreign tourists must equal Total guests.',
            ])->withInput();
        }

        // Get and validate service
        $service = Service::where('service_id', $validated['service_id'])
            ->where('operator_id', $user->id)
            ->where('status', 'Approved')
            ->first();

        if (!$service) {
            return back()->withErrors([
                'service_id' => 'Invalid service. Service must be approved and owned by you.',
            ])->withInput();
        }

        // Get attraction_id from service if not provided
        $attractionId = $validated['attraction_id'] ?? $service->tourist_spot_id;

        // Filter out empty guest names
        $guestNames = array_filter($validated['guest_names'] ?? [], fn ($name) => !empty($name));
        $guestNames = !empty($guestNames) ? array_values($guestNames) : null;

        // Create guest list record
        $guestList = GuestList::create([
            'service_id' => $service->service_id,
            'attraction_id' => $attractionId,
            'operator_id' => $user->id,
            'visit_date' => $validated['visit_date'],
            'total_guests' => $validated['total_guests'],
            'local_tourists' => $validated['local_tourists'],
            'foreign_tourists' => $validated['foreign_tourists'],
            'status' => 'Pending Entrance',
            'notes' => $validated['notes'],
            'guest_names' => $guestNames,
        ]);

        // Generate QR codes with custom format
        $prefix = 'TR'; // static or configurable
        $locationCode = 'BDN'; // static or from service/location
        $year = date('Y', strtotime($validated['visit_date']));
        
        // Get the highest serial number for this prefix/location/year combination
        $maxToken = GuestListQRCode::where('token', 'like', "$prefix-$locationCode-$year-%")
            ->latest('id')
            ->first();
        
        $nextSerial = 1;
        if ($maxToken) {
            // Extract the serial number from the last token (last 4 digits)
            preg_match('/(\d{4})$/', $maxToken->token, $matches);
            if ($matches) {
                $nextSerial = (int)$matches[1] + 1;
            }
        }
        
        for ($i = 0; $i < $validated['total_guests']; $i++) {
            $serial = str_pad($nextSerial + $i, 4, '0', STR_PAD_LEFT);
            $codeName = "$prefix-$locationCode-$year-$serial";
            GuestListQRCode::create([
                'guest_list_id' => $guestList->id,
                'guest_index' => $i,
                'token' => $codeName,
                'status' => 'Unused',
                'expiration_date' => $validated['visit_date'],
            ]);
        }

        return redirect()->route('operator.guest-submission.index')
            ->with('success', "Guest list submitted successfully! {$validated['total_guests']} QR codes generated.");
    }

    /**
     * Show guest list details.
     */
    public function show($id)
    {
        $user = auth()->user();
        
        // Get guest list and verify ownership
        $guestList = GuestList::where('id', $id)
            ->where('operator_id', $user->id)
            ->firstOrFail();

        // Get related QR codes
        $qrCodes = $guestList->qrCodes()
            ->select('id', 'guest_list_id', 'token', 'status', 'expiration_date', 'used_at')
            ->get()
            ->map(function ($qr) {
                return [
                    'id' => $qr->id,
                    'token' => $qr->token,
                    'status' => $qr->status,
                    'expirationDate' => $qr->expiration_date->format('M d, Y'),
                    'usedAt' => $qr->used_at ? $qr->used_at->format('M d, Y H:i') : null,
                ];
            });

        // Count QR code statuses
        $qrStats = [
            'total' => $guestList->qrCodes->count(),
            'used' => $guestList->qrCodes->where('status', 'Used')->count(),
            'unused' => $guestList->qrCodes->where('status', 'Unused')->count(),
            'expired' => $guestList->qrCodes->where('status', 'Expired')->count(),
        ];

        // build guide information from DB
        $assignedGuides = $guestList->assignments()
            ->with('guide')
            ->active()
            ->get()
            ->map(fn($assign) => [
                'id' => $assign->guide->id,
                'name' => $assign->guide->full_name ?? $assign->guide->name ?? 'Unknown',
            ])->toArray();

        // compute available/eligible guide count using service helper
        $availableGuides = 0;
        try {
            $service = app(\App\Services\GuideAssignmentService::class);
            $eligible = $service->getEligibleGuides($guestList, [
                'service_type' => $guestList->service->service_type ?? null,
            ]);
            $availableGuides = $eligible->count();
        } catch (\Throwable $e) {
            // fail gracefully if service not bound or other error
            $availableGuides = Guide::approved()->count();
        }

        return Inertia::render('operator/guest-submission-details', [
            'guestList' => [
                'id' => $guestList->id,
                'serviceName' => $guestList->service->service_name ?? 'Unknown Service',
                'serviceType' => $guestList->service->service_type ?? 'Unknown',
                'totalGuests' => $guestList->total_guests,
                'localTourists' => $guestList->local_tourists,
                'foreignTourists' => $guestList->foreign_tourists,
                'guestNames' => $guestList->guest_names ?? [],
                'visitDate' => $guestList->visit_date->format('M d, Y'),
                'status' => $guestList->status,
                'notes' => $guestList->notes,
                'createdAt' => $guestList->created_at->format('M d, Y H:i'),
            ],
            'qrCodes' => $qrCodes,
            'qrStats' => $qrStats,
            'assignedGuides' => $assignedGuides,
            'availableGuides' => $availableGuides,
        ]);
    }

    /**
     * Delete a guest list.
     */
    public function destroy($id)
    {
        $user = auth()->user();
        
        $guestList = GuestList::where('id', $id)
            ->where('operator_id', $user->id)
            ->firstOrFail();

        $guestList->qrCodes()->delete();
        $guestList->delete();

        return redirect()->route('operator.guest-submission.index')
            ->with('success', 'Guest list deleted successfully.');
    }
}