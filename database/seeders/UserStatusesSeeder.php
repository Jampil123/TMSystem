<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class UserStatusesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('user_statuses')->insert([
            // ACCOUNT STATUSES
            [
                'status' => 'PENDING',
                'type' => 'ACCOUNT',
                'description' => 'User is waiting for admin approval.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status' => 'APPROVED',
                'type' => 'ACCOUNT',
                'description' => 'User is approved and allowed to access the system.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status' => 'REJECTED',
                'type' => 'ACCOUNT',
                'description' => 'User registration was rejected.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status' => 'SUSPENDED',
                'type' => 'ACCOUNT',
                'description' => 'User is temporarily suspended.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status' => 'BLOCKED',
                'type' => 'ACCOUNT',
                'description' => 'User is permanently blocked.',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // ONLINE STATUSES
            [
                'status' => 'ONLINE',
                'type' => 'ONLINE',
                'description' => 'User is currently logged in.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status' => 'OFFLINE',
                'type' => 'ONLINE',
                'description' => 'User is currently logged out.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
