<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\UserProfile;
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

        // eager load role, account/status, and profile relations
        $user->loadMissing(['role', 'accountStatus', 'profile']);

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
            'profile' => $user->profile,
            'documents' => $documents,
        ]);
    }

    /**
     * Update the operator profile with business details and profile picture.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'business_name' => 'nullable|string|max:255',
            'operator_type' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'years_of_operation' => 'nullable|integer|min:0',
            'contact_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'lgu_area' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        // handle profile picture upload
        if ($request->hasFile('profile_picture')) {
            // delete old profile picture if exists
            $profile = $user->profile;
            if ($profile && $profile->profile_picture) {
                Storage::disk('public')->delete($profile->profile_picture);
            }
            $file = $request->file('profile_picture');
            $path = $file->store('profile_pictures', 'public');
            $validated['profile_picture'] = $path;
        }

        // Get or create the profile
        $profile = $user->profile ?? new UserProfile(['user_id' => $user->id]);
        $profile->fill($validated);
        $profile->save();

        // Reload user with updated profile
        $user->load('profile');

        return redirect()->back()->with('success', 'Profile updated successfully!');
    }
}
