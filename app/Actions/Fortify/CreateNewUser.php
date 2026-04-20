<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Models\Role;
use App\Models\Userstatus;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        // Determine registration type (default to 'tourist')
        $registrationType = $input['registration_type'] ?? 'tourist';

        // Get offline status - new users start as offline
        $offlineStatus = Userstatus::where('status', 'OFFLINE')->where('type', 'ONLINE')->first();

        // Set role and status based on registration type
        if ($registrationType === 'operator') {
            // Operator/Staff/Admin registration - requires admin approval
            $role = Role::where('name', 'External Operator')->first() ?? 
                    Role::where('name', 'Operator')->first();
            $accountStatus = Userstatus::where('status', 'PENDING')->first();
        } else {
            // Tourist registration - immediately active
            $role = Role::where('name', 'Tourist')->first();
            $accountStatus = Userstatus::where('status', 'APPROVED')->first();
        }

        return User::create([
            'name' => $input['name'],
            'username' => $input['username'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role_id' => $role?->id,
            'account_status_id' => $accountStatus?->id,
            'online_status_id' => $offlineStatus?->id,
        ]);
    }
}
