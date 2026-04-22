<?php

namespace App\Http\Controllers\Portal;

use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Validation\Rules\Password;

class TouristAuthController extends Controller
{
    /**
     * Show the login form
     */
    public function showLogin()
    {
        return view('portal.auth.login');
    }

    /**
     * Show the signup form
     */
    public function showSignup()
    {
        return view('portal.auth.register');
    }

    /**
     * Handle login request
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
            'remember' => ['boolean'],
        ]);

        $remember = $request->boolean('remember', false);

        // Try to authenticate with email or username
        $user = User::where('email', $credentials['email'])
            ->orWhere('username', $credentials['email'])
            ->first();

        if ($user && Auth::guard('web')->attempt(
            [
                'email' => $user->email,
                'password' => $credentials['password'],
            ],
            $remember
        )) {
            $request->session()->regenerate();

            return redirect()->intended(route('tourist.dashboard'));
        }

        return back()
            ->withInput($request->only('email', 'remember'))
            ->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ]);
    }

    /**
     * Handle logout request
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/portal');
    }

    /**
     * Register a new tourist (delegated to CreateNewUser)
     */
    public function register(Request $request)
    {
        // This is handled by RegisteredUserController now
        return app('App\Http\Controllers\Auth\RegisteredUserController')->store(
            $request->merge(['registration_type' => 'tourist'])
        );
    }
}
