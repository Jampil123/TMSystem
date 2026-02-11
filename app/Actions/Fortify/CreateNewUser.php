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

        // Get default role (Tourist) - ID is 6 based on seeder
        $touristRole = Role::where('name', 'Tourist')->first();
        
        // Get default status (PENDING) - new users start as pending approval
        $pendingStatus = Userstatus::where('status', 'PENDING')->first();
        
        // Get offline status - new users start as offline
        $offlineStatus = Userstatus::where('status', 'OFFLINE')->where('type', 'ONLINE')->first();

        return User::create([
            'name' => $input['name'],
            'username' => $input['username'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role_id' => $touristRole?->id,
            'account_status_id' => $pendingStatus?->id,
            'online_status_id' => $offlineStatus?->id,
        ]);
    }
}
