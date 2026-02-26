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
        // Modify the status column to accept lowercase enum values
        Schema::table('services', function (Blueprint $table) {
            DB::statement("ALTER TABLE services MODIFY status ENUM('pending', 'approved', 'rejected', 'revision_required', 'inactive') NOT NULL DEFAULT 'pending'");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            DB::statement("ALTER TABLE services MODIFY status ENUM('Pending', 'Approved', 'Rejected', 'Revision Required', 'Inactive') NOT NULL DEFAULT 'Pending'");
        });
    }
};
