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
        
        // Get default status (Pending) - ID is 3 based on seeder
        $pendingStatus = Userstatus::where('status', 'Pending')->first();

        return User::create([
            'name' => $input['name'],
            'username' => $input['username'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role_id' => $touristRole?->id,
            'user_status_id' => $pendingStatus?->id,
        ]);
    }
}
