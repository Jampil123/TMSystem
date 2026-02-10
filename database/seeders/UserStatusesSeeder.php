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
            [
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status' => 'Inactive',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status' => 'Pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'status' => 'Blocked',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
