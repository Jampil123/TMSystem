<?php

namespace App\Http\Controllers;

use App\Models\Guide;
use App\Models\GuideCertification;
use App\Models\GuestList;
use App\Models\GuideAssignment;
use App\Services\GuideAssignmentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class GuideController extends Controller
{
    /**
     * Show guide registration form.
     */
    public function create()
    {
        return Inertia::render('guides/register', [
            'specialtyOptions' => [
                'Hiking',
                'Cultural Tours',
                'Marine Activities',
                'Mountain Climbing',
                'Water Sports',
                'Historical Sites',
                'Wildlife Safari',
                'Adventure Sports',
                'Food & Wine',
                'Photography Tours',
            ],
        ]);
    }

    /**
     * Store guide registration.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'full_name' => 'required|string|max:255',
                'contact_number' => 'required|string|max:20',
                'email' => 'required|email|unique:guides,email',
                'id_type' => 'required|string',
                'id_number' => 'required|string|unique:guides,id_number',
                'id_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB
                'years_of_experience' => 'required|integer|min:0|max:70',
                'specialty_areas' => 'required|array|min:1',
                'specialty_areas.*' => 'string',
                'certifications' => 'nullable|array',
                'certifications.*.certification_name' => 'nullable|string|max:255',
                'certifications.*.issued_by' => 'nullable|string|max:255',
                'certifications.*.issued_date' => 'nullable|date',
                'certifications.*.expiry_date' => 'nullable|date|after_or_equal:certifications.*.issued_date',
                'certifications.*.certificate_file' => 'nullable|file|mimes:pdf,jpeg,png,jpg,gif|max:5120', // 5MB
            ]);

            // Handle ID image upload
            $idImagePath = null;
            if ($request->hasFile('id_image')) {
                $idImagePath = $request->file('id_image')->store('guides/id-images', 'public');
            }

            // Create guide
            $guide = Guide::create([
                'full_name' => $validated['full_name'],
                'contact_number' => $validated['contact_number'],
                'email' => $validated['email'],
                'id_type' => $validated['id_type'],
                'id_number' => $validated['id_number'],
                'id_image_path' => $idImagePath,
                'years_of_experience' => $validated['years_of_experience'],
                'specialty_areas' => $validated['specialty_areas'],
                'status' => 'Pending',
            ]);

            // Store certifications
            if ($validated['certifications'] ?? false) {
                foreach ($validated['certifications'] as $cert) {
                    if ($cert['certification_name'] ?? false) {
                        $certPath = null;
                        if (isset($cert['certificate_file'])) {
                            $certPath = $cert['certificate_file']->store('guides/certifications', 'public');
                        }

                        GuideCertification::create([
                            'guide_id' => $guide->id,
                            'certification_name' => $cert['certification_name'],
                            'issued_by' => $cert['issued_by'] ?? null,
                            'issued_date' => $cert['issued_date'] ?? null,
                            'expiry_date' => $cert['expiry_date'] ?? null,
                            'certificate_file_path' => $certPath,
                            'status' => $this->getCertificationStatus($cert['expiry_date'] ?? null),
                        ]);
                    }
                }
            }

            return redirect()->route('guides.registration-success', ['guide' => $guide->id])
                ->with('success', 'Guide registration submitted successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            \Log::error('Guide registration error: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'An error occurred: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Show registration success page.
     */
    public function registrationSuccess(Guide $guide)
    {
        return Inertia::render('guides/registration-success', [
            'guide' => [
                'id' => $guide->id,
                'full_name' => $guide->full_name,
                'email' => $guide->email,
                'status' => $guide->status,
            ],
        ]);
    }

    /**
     * Show guide details (for admin).
     */
    public function show(Guide $guide)
    {
        return Inertia::render('admin/guides/show', [
            'guide' => $this->formatGuideData($guide),
        ]);
    }

    /**
     * Helper function to get certification status.
     */
    private function getCertificationStatus(?string $expiryDate): string
    {
        if (!$expiryDate) {
            return 'Valid';
        }

        $expiry = \Carbon\Carbon::parse($expiryDate);
        if ($expiry->isPast()) {
            return 'Expired';
        }

        if ($expiry->diffInDays(now()) <= 30) {
            return 'Expiring Soon';
        }

        return 'Valid';
    }

    /**
     * Format guide data for display.
     */
    private function formatGuideData(Guide $guide): array
    {
        return [
            'id' => $guide->id,
            'full_name' => $guide->full_name,
            'contact_number' => $guide->contact_number,
            'email' => $guide->email,
            'id_type' => $guide->id_type,
            'id_number' => $guide->id_number,
            'id_image_path' => $guide->id_image_path,
            'years_of_experience' => $guide->years_of_experience,
            'specialty_areas' => $guide->specialty_areas,
            'status' => $guide->status,
            'rejection_reason' => $guide->rejection_reason,
            'reviewed_by' => $guide->reviewer?->name,
            'reviewed_at' => $guide->reviewed_at?->format('M d, Y H:i'),
            'created_at' => $guide->created_at->format('M d, Y H:i'),
            'certifications' => $guide->certifications->map(function ($cert) {
                return [
                    'id' => $cert->id,
                    'certification_name' => $cert->certification_name,
                    'issued_by' => $cert->issued_by,
                    'issued_date' => $cert->issued_date->format('M d, Y'),
                    'expiry_date' => $cert->expiry_date?->format('M d, Y'),
                    'certificate_file_path' => $cert->certificate_file_path,
                    'status' => $cert->status,
                    'days_until_expiry' => $cert->daysUntilExpiry(),
                ];
            })->toArray(),
        ];
    }

    /**
     * Get eligible guides for assignment to a guest list.
     * Step 2: System Filters Eligible Guides
     */
    public function getEligibleGuides(Request $request, GuestList $guestList)
    {
        $service = new GuideAssignmentService();

        $filters = $request->validate([
            'service_type' => 'nullable|string',
            'required_certification' => 'nullable|string',
        ]);

        try {
            $eligibleGuides = $service->getEligibleGuides($guestList, $filters);

            $guidesData = $eligibleGuides->map(function (Guide $guide) use ($service, $guestList) {
                $details = $service->getGuideAvailabilityDetails($guide, $guestList->visit_date);
                return [
                    'id' => $guide->id,
                    'full_name' => $guide->full_name ?? 'Unknown Guide',
                    'email' => $guide->email ?? 'No email',
                    'contact_number' => $guide->contact_number ?? 'No number',
                    'years_of_experience' => $guide->years_of_experience ?? 0,
                    'specialty_areas' => is_array($guide->specialty_areas) ? $guide->specialty_areas : [],
                    'is_available' => $details['is_available'],
                    'expiry_status' => $details['expiry_status'],
                    'assignment_summary' => $details['assignment_summary'],
                    'expired_certifications' => $details['expired_certifications'],
                    'expiring_soon_certifications' => $details['expiring_soon_certifications'],
                ];
            })->toArray();

            return response()->json([
                'success' => true,
                'data' => $guidesData,
                'count' => count($guidesData),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Assign a guide to a guest list.
     * Step 3 & 4: Guide Selection and Assignment Confirmation
     */
    public function assignGuide(Request $request, GuestList $guestList)
    {
        $validated = $request->validate([
            'guide_id' => 'required|exists:guides,id',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'service_type' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $service = new GuideAssignmentService();
        $guide = Guide::findOrFail($validated['guide_id']);

        try {
            // Check if assignment is allowed
            $assignment = $service->assignGuide(
                $guestList,
                $guide,
                [
                    'start_time' => now()->setHour(intval(explode(':', $validated['start_time'])[0]))->setMinute(intval(explode(':', $validated['start_time'])[1])),
                    'end_time' => now()->setHour(intval(explode(':', $validated['end_time'])[0]))->setMinute(intval(explode(':', $validated['end_time'])[1])),
                    'service_type' => $validated['service_type'],
                    'notes' => $validated['notes'],
                ],
                Auth::user()
            );

            return response()->json([
                'success' => true,
                'message' => "Guide {$guide->full_name} has been assigned successfully!",
                'data' => [
                    'assignment_id' => $assignment->id,
                    'status' => $assignment->assignment_status,
                    'compliance_status' => $assignment->compliance_status,
                    'has_warnings' => $assignment->has_certification_warning || $assignment->has_availability_conflict,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Auto-assign a guide based on best fit.
     * Option B from Step 3: Auto-Assignment
     */
    public function autoAssignGuide(Request $request, GuestList $guestList)
    {
        $validated = $request->validate([
            'service_type' => 'nullable|string',
            'required_certification' => 'nullable|string',
        ]);

        $service = new GuideAssignmentService();

        try {
            // Auto-assign multiple guides based on guest count
            $assignments = $service->autoAssignMultipleGuides(
                $guestList,
                $validated,
                Auth::user()
            );

            if (empty($assignments)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No eligible guides available for this assignment.',
                ], 400);
            }

            $guideNames = implode(', ', collect($assignments)->map(fn($a) => $a->guide->full_name)->toArray());

            return response()->json([
                'success' => true,
                'message' => count($assignments) . " guide(s) auto-assigned: {$guideNames}",
                'data' => [
                    'assignments_count' => count($assignments),
                    'guides_assigned' => collect($assignments)->pluck('guide.full_name')->toArray(),
                ],
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'One or more guides are already assigned to this guest list.',
                    'code' => 'DUPLICATE_ASSIGNMENT',
                ], 400);
            }
            return response()->json([
                'success' => false,
                'message' => 'Database error occurred',
            ], 400);
        } catch (\Exception $e) {
            $message = $e->getMessage();
            
            // Return user-friendly messages for common cases
            if (strpos($message, 'already been assigned') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => '✅ All required guides have been assigned! The 1:1 safety ratio is met.',
                    'code' => 'SAFETY_RATIO_MET',
                ], 200);
            } elseif (strpos($message, 'already assigned to this guest list') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'This guide is already assigned to this guest list.',
                    'code' => 'GUIDE_DUPLICATE',
                ], 400);
            }
            
            return response()->json([
                'success' => false,
                'message' => $message,
            ], 400);
        }
    }

    /**
     * Confirm an assignment (change from Pending to Confirmed).
     */
    public function confirmAssignment(GuideAssignment $assignment)
    {
        try {
            $assignment->confirm();

            return response()->json([
                'success' => true,
                'message' => 'Assignment confirmed successfully!',
                'data' => [
                    'assignment_id' => $assignment->id,
                    'status' => $assignment->assignment_status,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Complete an assignment.
     */
    public function completeAssignment(GuideAssignment $assignment)
    {
        try {
            $assignment->complete();

            return response()->json([
                'success' => true,
                'message' => 'Assignment marked as completed!',
                'data' => [
                    'assignment_id' => $assignment->id,
                    'status' => $assignment->assignment_status,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Cancel an assignment.
     */
    public function cancelAssignment(GuideAssignment $assignment, Request $request)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        try {
            $assignment->cancel($validated['reason']);

            return response()->json([
                'success' => true,
                'message' => 'Assignment cancelled successfully!',
                'data' => [
                    'assignment_id' => $assignment->id,
                    'status' => $assignment->assignment_status,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get assignment details with full information.
     */
    public function getAssignmentDetails(GuideAssignment $assignment)
    {
        $service = new GuideAssignmentService();
        $guide = $assignment->guide;
        $guestList = $assignment->guestList;

        $assignmentData = [
            'id' => $assignment->id,
            'guest_list_id' => $assignment->guest_list_id,
            'guide' => [
                'id' => $guide->id,
                'full_name' => $guide->full_name,
                'email' => $guide->email,
                'contact_number' => $guide->contact_number,
                'specialty_areas' => $guide->specialty_areas,
                'years_of_experience' => $guide->years_of_experience,
            ],
            'guest_list' => [
                'id' => $guestList->id,
                'visit_date' => $guestList->visit_date->format('Y-m-d'),
                'total_guests' => $guestList->total_guests,
                'status' => $guestList->status,
            ],
            'assignment_date' => $assignment->assignment_date->format('Y-m-d'),
            'start_time' => $assignment->start_time->format('H:i'),
            'end_time' => $assignment->end_time->format('H:i'),
            'guest_count' => $assignment->guest_count,
            'status' => $assignment->assignment_status,
            'compliance_status' => $assignment->compliance_status,
            'compliance_notes' => $assignment->compliance_notes,
            'has_certification_warning' => $assignment->has_certification_warning,
            'has_availability_conflict' => $assignment->has_availability_conflict,
            'available_details' => $service->getGuideAvailabilityDetails($guide, $guestList->visit_date->format('Y-m-d')),
        ];

        return response()->json([
            'success' => true,
            'data' => $assignmentData,
        ]);
    }

    /**
     * Debug endpoint: Show why guides are/aren't eligible
     */
    public function debugEligibleGuides(Request $request, GuestList $guestList)
    {
        $service = new GuideAssignmentService();
        $allGuides = Guide::all();

        $debugData = $allGuides->map(function (Guide $guide) use ($service, $guestList) {
            $reasons = [];

            // Check each eligibility rule
            if ($guide->status !== 'Approved') {
                $reasons[] = "Status is '{$guide->status}' (not Approved)";
            }

            $expiredCerts = $guide->certifications()
                ->where('expiry_date', '<', now())
                ->count();
            if ($expiredCerts > 0) {
                $reasons[] = "Has {$expiredCerts} expired certification(s)";
            }

            $timeConflict = \App\Models\GuideAssignment::where('guide_id', $guide->id)
                ->where('assignment_date', $guestList->visit_date)
                ->active()
                ->count();
            if ($timeConflict > 0) {
                $reasons[] = "Has {$timeConflict} existing assignment(s) on {$guestList->visit_date}";
            }

            $unavailable = $guide->availabilities()
                ->where('status', '!=', 'Available')
                ->where(function ($q) use ($guestList) {
                    $q->whereDate('start_date', '<=', $guestList->visit_date)
                        ->whereDate('end_date', '>=', $guestList->visit_date);
                })
                ->count();
            if ($unavailable > 0) {
                $reasons[] = "Marked unavailable on {$guestList->visit_date}";
            }

            $specialties = $guide->specialty_areas ?? [];
            if (!empty($specialties) && !in_array($guestList->service->service_type ?? null, $specialties, true)) {
                $reasons[] = "Specialty areas (" . implode(', ', $specialties) . ") don't match service type '{$guestList->service->service_type}'";
            }

            return [
                'guide_id' => $guide->id,
                'full_name' => $guide->full_name ?? 'Unknown',
                'status' => $guide->status,
                'specialties' => $specialties,
                'certifications_count' => $guide->certifications()->count(),
                'eligible' => empty($reasons),
                'filter_reasons' => $reasons,
            ];
        });

        return response()->json([
            'guest_list_id' => $guestList->id,
            'visit_date' => $guestList->visit_date,
            'service_type' => $guestList->service->service_type ?? null,
            'all_guides' => $debugData,
            'eligible_count' => $debugData->filter(fn($g) => $g['eligible'])->count(),
        ]);
    }}