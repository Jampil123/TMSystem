<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Fortify\CreateNewUser;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class RegisteredUserController extends Controller
{
    /**
     * Create a newly registered user.
     */
    public function store(Request $request): mixed
    {
        $creator = app(CreatesNewUsers::class);
        $user = $creator->create($request->all());

        event(new Registered($user));

        // Check if user is pending - if so, don't log them in or redirect
        if ($user->accountStatus && $user->accountStatus->status === 'PENDING') {
            // For pending users, stay on the page and show success message
            // Set a flash message for the success screen
            session()->flash('registration_status', 'pending');
            session()->flash('registration_message', 'Account registered. Awaiting admin approval.');
            
            // Redirect back to register page to show success message
            // This will trigger the onSuccess callback without actually redirecting away
            return redirect()->back();
        }

        // For approved users (tourist), log them in and redirect to dashboard
        Auth::login($user, $request->boolean('remember'));

        // Redirect to tourist dashboard
        return redirect()->intended(route('tourist.dashboard'));
    }
}

