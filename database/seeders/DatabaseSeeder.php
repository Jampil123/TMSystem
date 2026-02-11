<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call your other seeders first
        $this->call([
            RolesTableSeeder::class,
            UserStatusesSeeder::class,
        ]);

        // Fetch the status IDs dynamically
        $approvedStatus = DB::table('user_statuses')
            ->where('status', 'APPROVED')
            ->where('type', 'ACCOUNT')
            ->value('id');

        $offlineStatus = DB::table('user_statuses')
            ->where('status', 'OFFLINE')
            ->where('type', 'ONLINE')
            ->value('id');

        // Create default admin user
        User::create([
            'name' => 'Administrator',
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin123'),
            'role_id' => 1, // Make sure this role exists
            'account_status_id' => $approvedStatus,
            'online_status_id' => $offlineStatus,
        ]);
    }
}
