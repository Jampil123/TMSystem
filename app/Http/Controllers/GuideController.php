<?php

namespace App\Http\Controllers;

use App\Models\Guide;
use App\Models\GuideCertification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

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
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email' => 'required|email|unique:guides,email',
            'id_type' => 'required|string',
            'id_number' => 'required|string|unique:guides,id_number',
            'id_image' => 'nullable|image|max:5120', // 5MB
            'years_of_experience' => 'required|integer|min:0|max:70',
            'specialty_areas' => 'required|array|min:1',
            'specialty_areas.*' => 'string',
            'certifications' => 'nullable|array',
            'certifications.*.certification_name' => 'nullable|string|max:255',
            'certifications.*.issued_by' => 'nullable|string|max:255',
            'certifications.*.issued_date' => 'nullable|date',
            'certifications.*.expiry_date' => 'nullable|date|after:certifications.*.issued_date',
            'certifications.*.certificate_file' => 'nullable|file|max:5120', // 5MB
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
                        'issued_by' => $cert['issued_by'],
                        'issued_date' => $cert['issued_date'],
                        'expiry_date' => $cert['expiry_date'],
                        'certificate_file_path' => $certPath,
                        'status' => $this->getCertificationStatus($cert['expiry_date'] ?? null),
                    ]);
                }
            }
        }

        return redirect()->route('guides.registration-success', ['guide' => $guide->id])
            ->with('success', 'Guide registration submitted successfully!');
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
}
