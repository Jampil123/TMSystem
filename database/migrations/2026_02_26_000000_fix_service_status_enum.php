<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ensure status column has all required enum values
        DB::statement("ALTER TABLE services MODIFY status ENUM('Pending', 'Approved', 'Rejected', 'Revision Required', 'Inactive') NOT NULL DEFAULT 'Pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE services MODIFY status ENUM('Pending', 'Approved', 'Rejected', 'Inactive') NOT NULL DEFAULT 'Pending'");
    }
};
