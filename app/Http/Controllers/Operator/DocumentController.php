<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\OperatorDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    /**
     * Required document names for operators.
     */
    private array $requiredDocuments = [
        'Business Permit',
        'Mayor\'s Permit',
        'Tourism Accreditation',
        'Insurance Certificate',
        'Valid ID',
    ];

    /**
     * Show the documents page.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        \Log::info('Documents index called', ['user_id' => $user->id, 'wantsJson' => $request->wantsJson()]);

        // Get or create document records for required documents
        $documents = [];
        foreach ($this->requiredDocuments as $docName) {
            $doc = OperatorDocument::where('user_id', $user->id)
                ->where('name', $docName)
                ->first();

            if (!$doc) {
                $doc = OperatorDocument::create([
                    'user_id' => $user->id,
                    'name' => $docName,
                    'status' => 'missing',
                ]);
                \Log::info('Document created', ['document_id' => $doc->id, 'name' => $docName]);
            }

            $documents[] = $doc;
        }

        \Log::info('Documents retrieved', ['count' => count($documents)]);

        // If request expects JSON (AJAX), return JSON
        if ($request->wantsJson()) {
            \Log::info('Returning JSON response', ['documents_count' => count($documents)]);
            return response()->json([
                'documents' => $documents,
            ]);
        }

        return Inertia::render('operator/documents', [
            'operator' => $user,
            'documents' => $documents,
        ]);
    }

    /**
     * Upload a document file.
     */
    public function upload(Request $request)
    {
        $user = Auth::user();
        \Log::info('Document upload started', ['user_id' => $user->id, 'request_data' => $request->all()]);

        $validated = $request->validate([
            'document_id' => 'required|integer|exists:operator_documents,id',
            'file' => 'required|file|max:10240', // 10 MB
        ]);
        \Log::info('Validation passed', ['validated_data' => $validated]);

        // Find the document record
        $document = OperatorDocument::where('id', $validated['document_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();
        \Log::info('Document record found', ['document_id' => $document->id, 'name' => $document->name]);

        // Delete old file if exists
        if ($document->file_path) {
            Storage::disk('public')->delete($document->file_path);
            \Log::info('Old file deleted', ['file_path' => $document->file_path]);
        }

        // Store new file
        $file = $request->file('file');
        $path = $file->store('operator_documents', 'public');
        \Log::info('File stored', ['file_path' => $path, 'original_name' => $file->getClientOriginalName()]);

        // Update document record
        $updated = $document->update([
            'file_path' => $path,
            'status' => 'pending',
            'uploaded_date' => now()->toDateString(),
        ]);
        \Log::info('Document record updated', ['updated' => $updated, 'document_id' => $document->id]);

        // Return JSON response instead of redirect for fetch API
        return response()->json([
            'success' => true,
            'message' => "{$document->name} uploaded successfully!",
            'document' => $document->fresh(),
        ]);
    }

    /**
     * Delete a document file.
     */
    public function destroy($documentId)
    {
        $user = Auth::user();
        $document = OperatorDocument::where('id', $documentId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Delete file from storage
        if ($document->file_path) {
            Storage::disk('public')->delete($document->file_path);
        }

        // Reset document to missing
        $document->update([
            'file_path' => null,
            'status' => 'missing',
            'uploaded_date' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document removed successfully.',
        ]);
    }

    /**
     * Submit documents for review.
     */
    public function submit(Request $request)
    {
        $user = Auth::user();
        
        // Check if all required documents are uploaded
        $documents = OperatorDocument::where('user_id', $user->id)
            ->whereIn('name', $this->requiredDocuments)
            ->get();

        $missingDocuments = $documents->filter(function ($doc) {
            return !$doc->file_path || trim($doc->file_path) === '';
        });

        if ($missingDocuments->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Please upload all required documents before submitting for review.',
            ], 422);
        }

        // Update user to mark documents as submitted
        try {
            $user->update([
                'documents_submitted_at' => now(),
            ]);

            \Log::info('Documents submitted for review', ['user_id' => $user->id]);

            return response()->json([
                'success' => true,
                'message' => 'Documents submitted for review successfully! The LGU will review your submission shortly.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error submitting documents', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while submitting your documents. Please try again.',
            ], 500);
        }
    }
}
