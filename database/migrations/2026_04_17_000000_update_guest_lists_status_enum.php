<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update the status enum to include 'active'
        DB::statement("ALTER TABLE guest_lists MODIFY status ENUM('Pending Entrance', 'Active', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending Entrance'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original enum values
        DB::statement("ALTER TABLE guest_lists MODIFY status ENUM('Pending Entrance', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending Entrance'");
    }
};
