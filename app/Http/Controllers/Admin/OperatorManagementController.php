<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\Userstatus;
use App\Models\OperatorDocument;
use App\Notifications\AccountApprovedNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OperatorManagementController extends Controller
{
    /**
     * Display a listing of operators.
     */
    public function index()
    {
        $operatorRole = Role::where('name', 'External Operator')->first();
        
        $operators = User::with('role', 'accountStatus', 'profile')
            ->where('role_id', $operatorRole?->id)
            ->get()
            ->map(function ($user) {
                $documents = OperatorDocument::where('user_id', $user->id)->get();
                $completedDocs = $documents->filter(function ($doc) {
                    return $doc->file_path && trim($doc->file_path) !== '';
                })->count();
                $totalDocs = $documents->count();
                
                // Determine submission status
                $allApproved = $documents->every(fn($doc) => $doc->status === 'approved');
                if (!$user->documents_submitted_at) {
                    $submissionStatus = 'pending_submission';
                } elseif ($allApproved) {
                    $submissionStatus = 'approved';
                } else {
                    $submissionStatus = 'submitted_for_review';
                }

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'username' => $user->username,
                    'business_name' => $user->profile?->business_name ?? 'N/A',
                    'status' => $user->accountStatus?->status ?? 'N/A',
                    'account_status_id' => $user->account_status_id,
                    'submission_status' => $submissionStatus,
                    'joinDate' => $user->created_at->format('Y-m-d'),
                    'documents_submitted_at' => $user->documents_submitted_at?->format('Y-m-d H:i') ?? null,
                    'documents' => [
                        'completed' => $completedDocs,
                        'total' => $totalDocs,
                    ],
                    'phone' => $user->profile?->phone ?? 'N/A',
                    'address' => $user->profile?->address ?? 'N/A',
                ];
            });

        $stats = [
            'total_operators' => count($operators),
            'approved_operators' => collect($operators)->where('status', 'APPROVED')->count(),
            'pending_operators' => collect($operators)->where('status', 'PENDING')->count(),
            'submitted_documents' => collect($operators)->filter(fn($op) => $op['documents_submitted_at'] !== null)->count(),
        ];

        $statuses = Userstatus::where('type', 'ACCOUNT')->pluck('status', 'id')->toArray();

        return Inertia::render('admin/operators/index', [
            'operators' => $operators,
            'stats' => $stats,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Display a specific operator with their documents.
     */
    public function show($operatorId)
    {
        $operator = User::with('role', 'accountStatus', 'profile')
            ->findOrFail($operatorId);

        $documents = OperatorDocument::where('user_id', $operatorId)
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'name' => $doc->name,
                    'status' => $doc->status,
                    'file_path' => $doc->file_path,
                    'uploaded_date' => $doc->uploaded_date,
                    'expires_date' => $doc->expires_date,
                    'notes' => $doc->notes,
                ];
            });

        $operatorData = [
            'id' => $operator->id,
            'name' => $operator->name,
            'email' => $operator->email,
            'username' => $operator->username,
            'status' => $operator->accountStatus?->status ?? 'N/A',
            'account_status_id' => $operator->account_status_id,
            'business_name' => $operator->profile?->business_name ?? 'N/A',
            'operator_type' => $operator->profile?->operator_type ?? 'N/A',
            'description' => $operator->profile?->description ?? '',
            'years_of_operation' => $operator->profile?->years_of_operation ?? null,
            'contact_name' => $operator->profile?->contact_name ?? 'N/A',
            'phone' => $operator->profile?->phone ?? 'N/A',
            'address' => $operator->profile?->address ?? 'N/A',
            'lgu_area' => $operator->profile?->lgu_area ?? 'N/A',
            'joinDate' => $operator->created_at->format('Y-m-d'),
            'documents_submitted_at' => $operator->documents_submitted_at?->format('Y-m-d H:i') ?? null,
        ];

        $statuses = Userstatus::where('type', 'ACCOUNT')->pluck('status', 'id')->toArray();

        return Inertia::render('admin/operators/show', [
            'operator' => $operatorData,
            'documents' => $documents,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Approve an operator.
     */
    public function approve($operatorId)
    {
        $operator = User::findOrFail($operatorId);
        $approvedStatus = Userstatus::where('status', 'APPROVED')
            ->where('type', 'ACCOUNT')
            ->firstOrFail();

        $operator->update([
            'account_status_id' => $approvedStatus->id,
        ]);

        // Send approval notification to the operator
        $operator->notify(new AccountApprovedNotification($operator));

        return response()->json([
            'success' => true,
            'message' => 'Operator approved successfully!',
            'email_notification' => [
                'sent' => true,
                'recipient' => $operator->email,
                'subject' => 'Your Account Has Been Approved! 🎉',
                'message' => "Approval email sent to {$operator->email}",
            ],
        ]);
    }

    /**
     * Reject an operator.
     */
    public function reject($operatorId)
    {
        $operator = User::findOrFail($operatorId);
        $rejectedStatus = Userstatus::where('status', 'REJECTED')
            ->where('type', 'ACCOUNT')
            ->firstOrFail();

        $operator->update([
            'account_status_id' => $rejectedStatus->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Operator rejected.',
        ]);
    }

    /**
     * Approve a single document.
     */
    public function approveDocument($operatorId, $documentId)
    {
        $operator = User::findOrFail($operatorId);
        $document = OperatorDocument::where('id', $documentId)
            ->where('user_id', $operatorId)
            ->firstOrFail();

        $document->update(['status' => 'approved']);

        $successMessage = 'Document approved successfully!';

        // Check if all documents are now approved using the User model method
        if ($operator->hasAllDocumentsApproved()) {
            $approvedStatus = Userstatus::where('status', 'APPROVED')
                ->where('type', 'ACCOUNT')
                ->firstOrFail();
            $operator->update(['account_status_id' => $approvedStatus->id]);

            // Send approval notification to the operator when all documents are approved
            $operator->notify(new AccountApprovedNotification($operator));

            $successMessage = "Document approved! All documents are now approved. Account approval email has been sent to {$operator->email}";
        }

        return redirect()->back()->with([
            'success' => $successMessage,
            'email_sent' => $operator->hasAllDocumentsApproved() ? true : false,
            'email_recipient' => $operator->hasAllDocumentsApproved() ? $operator->email : null,
        ]);
    }

    /**
     * Reject a single document.
     */
    public function rejectDocument($operatorId, $documentId)
    {
        $operator = User::findOrFail($operatorId);
        $document = OperatorDocument::where('id', $documentId)
            ->where('user_id', $operatorId)
            ->firstOrFail();

        $document->update(['status' => 'rejected']);

        // If operator is currently approved, reset them to pending since a document was rejected
        if ($operator->accountStatus?->status === 'APPROVED') {
            $pendingStatus = Userstatus::where('status', 'PENDING')
                ->where('type', 'ACCOUNT')
                ->firstOrFail();
            $operator->update(['account_status_id' => $pendingStatus->id]);
        }

        return redirect()->back()->with('success', 'Document rejected.');
    }
}
