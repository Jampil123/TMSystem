<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\OperatorProfile;
use App\Models\OperatorDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
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
     * Show the operator profile page with data from the database.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // eager load role and account status relations
        $user->loadMissing(['role', 'accountStatus']);

        // Get or create the operator profile
        $profile = OperatorProfile::where('user_id', $user->id)->first();

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
            }

            $documents[] = $doc;
        }

        return Inertia::render('operator/profile', [
            'operator' => $user,
            'profile' => $profile,
            'documents' => $documents,
        ]);
    }

    /**
     * Update the operator profile with business details and logo.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'business_address' => 'required|string',
            'description' => 'nullable|string',
            'logo_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        // Get existing profile or create new one
        $profile = OperatorProfile::where('user_id', $user->id)->first();
        
        // handle logo upload
        if ($request->hasFile('logo_path') && $request->file('logo_path')->isValid()) {
            try {
                // delete old logo if exists
                if ($profile && $profile->logo_path) {
                    Storage::disk('public')->delete($profile->logo_path);
                }
                
                $file = $request->file('logo_path');
                
                // Create a unique filename
                $filename = 'operator_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
                
                // Store the file in public disk
                $path = $file->storeAs('operator_logos', $filename, 'public');
                
                if (!$path) {
                    throw new \Exception('Failed to store file');
                }
                
                $validated['logo_path'] = $path;
                
            } catch (\Exception $e) {
                return redirect()->back()->withInput()->with('error', 'Failed to upload logo: ' . $e->getMessage());
            }
        } else if ($profile) {
            // Keep existing logo path if not updating
            $validated['logo_path'] = $profile->logo_path;
        }

        // Create or update the profile
        if ($profile) {
            $profile->update($validated);
        } else {
            $profile = OperatorProfile::create([
                'user_id' => $user->id,
                ...$validated
            ]);
        }

        return redirect()->back()->with('success', 'Profile updated successfully!');
    }
}
