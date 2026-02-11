<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Models\Userstatus;
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

        // Check if user account status is APPROVED
        if (! $user->accountStatus || $user->accountStatus->status !== 'APPROVED') {
            match ($user->accountStatus?->status) {
                'PENDING' => throw ValidationException::withMessages([
                    Fortify::username() => [
                        'Your account is pending approval. Please wait for an administrator to review your registration.'
                    ],
                ]),
                'REJECTED' => throw ValidationException::withMessages([
                    Fortify::username() => [
                        'Your account registration was rejected. Please contact an administrator.'
                    ],
                ]),
                'SUSPENDED' => throw ValidationException::withMessages([
                    Fortify::username() => [
                        'Your account is temporarily suspended. Please contact an administrator.'
                    ],
                ]),
                'BLOCKED' => throw ValidationException::withMessages([
                    Fortify::username() => [
                        'Your account is permanently blocked. Please contact an administrator.'
                    ],
                ]),
                default => throw ValidationException::withMessages([
                    Fortify::username() => [
                        'Your account is not approved. Please contact an administrator.'
                    ],
                ]),
            };
        }

        // Set online status to ONLINE
        $onlineStatus = Userstatus::where('status', 'ONLINE')
            ->where('type', 'ONLINE')
            ->first();
        
        $user->update(['online_status_id' => $onlineStatus?->id]);

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
