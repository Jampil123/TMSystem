<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\LogsFailedLogins;
use Laravel\Fortify\Fortify;

class AttemptToAuthenticate
{
    /**
     * Handle the incoming request.
     */
    public function __invoke($request): void
    {
        $input = $request->only(Fortify::username(), 'password');

        // Try to find user by email or username
        $user = User::where('email', $input[Fortify::username()])
            ->orWhere('username', $input[Fortify::username()])
            ->first();

        if (! $user || ! Hash::check($input['password'], $user->password)) {
            $this->throwFailedAuthenticationException($request);
        }

        // Check if user account status is Pending or Blocked
        if ($user->userStatus && in_array($user->userStatus->status, ['Pending', 'Blocked'])) {
            throw ValidationException::withMessages([
                Fortify::username() => [
                    'Your account is ' . strtolower($user->userStatus->status) . '. Please contact an administrator.'
                ],
            ]);
        }

        Auth::login($user, $request->boolean('remember'));
    }

    /**
     * Throw a failed authentication exception.
     */
    protected function throwFailedAuthenticationException($request): never
    {
        throw ValidationException::withMessages([
            Fortify::username() => [trans('auth.failed')],
        ]);
    }
}
