<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    /**
     * Show the contact form page
     */
    public function show()
    {
        return Inertia::render('portal/contact');
    }

    /**
     * Store a contact message
     */
    public function store(Request $request)
    {
        // Validate the incoming request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:10|max:5000',
        ]);

        // Store the contact message
        Contact::create($validated);

        // Return with success message
        return back()->with('success', 'Your message has been sent successfully! We will get back to you shortly.');
    }
}
