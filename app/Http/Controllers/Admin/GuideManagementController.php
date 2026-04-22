<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guide;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuideManagementController extends Controller
{
    /**
     * Display all guides.
     */
    public function create()
    {
        // Render the dedicated admin registration page with specialty options
        return Inertia::render('admin/guides/create', [
            'specialtyOptions' => [
                'Canyoneering (Kawasan Falls)',
                'Waterfall Tours',
                'Kawasan Falls Guiding',
                'River Trekking',
                'Snorkeling Guide',
                'Sardine Run Tour',
                'Island Hopping',
                'Marine Conservation Guide',
                'Hiking',
                'Trekking Guide',
                'Eco-Tour Guide',
                'Nature Interpretation',
                'Cultural Tour Guide',
                'Local Community Guide',
                'Heritage Tour',
                'Transportation Service',
                'Tour Coordinator',
                'Equipment Handling',
            ],
        ]);
    }


    public function index(Request $request)
    {
        $query = Guide::query();

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%");
            });
        }

        $guides = $query->with('certifications', 'reviewer')
            ->orderByRaw("FIELD(status, 'Pending', 'Approved', 'Rejected')")
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Get counts
        $pendingCount = Guide::pending()->count();
        $approvedCount = Guide::approved()->count();
        $rejectedCount = Guide::rejected()->count();

        return Inertia::render('admin/guides/index', [
            'guides' => $guides->map(function ($guide) {
                return $this->formatGuideData($guide);
            })->all(),
            'pagination' => [
                'current_page' => $guides->currentPage(),
                'last_page' => $guides->lastPage(),
                'per_page' => $guides->perPage(),
                'total' => $guides->total(),
            ],
            'counts' => [
                'pending' => $pendingCount,
                'approved' => $approvedCount,
                'rejected' => $rejectedCount,
                'total' => $pendingCount + $approvedCount + $rejectedCount,
            ],
            'filters' => [
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? '',
            ],
            'specialtyOptions' => [
                'Canyoneering',
                'Rock Climbing',
                'Hiking',
                'Cultural Tours',
                'Marine Activities',
                'Mountain Climbing',
                'Water Sports',
                'Historical Sites',
                'Adventure Sports',
                'Food & Wine',
                'Photography Tours',
            ],
        ]);
    }

    /**
     * Show guide details.
     */
    public function show(Guide $guide)
    {
        return Inertia::render('admin/guides/show', [
            'guide' => $this->formatGuideData($guide->load('certifications', 'reviewer')),
        ]);
    }

    /**
     * Approve a guide.
     */
    public function approve(Request $request, Guide $guide)
    {
        if ($guide->status !== 'Pending') {
            return redirect()->back()->withErrors('Only pending guides can be approved.');
        }

        $guide->approve(auth()->user());

        return redirect()->back()->with('success', 'Guide approved successfully');
    }

    /**
     * Reject a guide.
     */
    public function reject(Request $request, Guide $guide)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        if ($guide->status !== 'Pending') {
            return redirect()->back()->withErrors('Only pending guides can be rejected.');
        }

        $guide->reject(auth()->user(), $validated['rejection_reason']);

        return redirect()->back()->with('success', 'Guide rejected successfully');
    }

    /**
     * Export guides list (CSV).
     */
    public function export(Request $request)
    {
        $query = Guide::query();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $guides = $query->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename=guides_' . now()->format('Y-m-d') . '.csv',
        ];

        $callback = function () use ($guides) {
            $file = fopen('php://output', 'w');
            
            // Header row
            fputcsv($file, ['Name', 'Email', 'Contact', 'Experience', 'Status', 'Specialties', 'Registered Date']);

            // Data rows
            foreach ($guides as $guide) {
                fputcsv($file, [
                    $guide->full_name,
                    $guide->email,
                    $guide->contact_number,
                    $guide->years_of_experience . ' years',
                    $guide->status,
                    implode(', ', $guide->specialty_areas ?? []),
                    $guide->created_at->format('M d, Y'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
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
            'has_expiring_certs' => $guide->hasExpiringCertifications(),
            'has_expired_certs' => $guide->hasExpiredCertifications(),
        ];
    }
}
