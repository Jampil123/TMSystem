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
        // Modify the service_type column to accept the correct enum values
        Schema::table('services', function (Blueprint $table) {
            DB::statement("ALTER TABLE services MODIFY service_type ENUM('adventure', 'tour', 'accommodation', 'restaurant', 'transport', 'rental', 'other') NOT NULL");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            DB::statement("ALTER TABLE services MODIFY service_type ENUM('Activity', 'Accommodation') NOT NULL");
        });
    }
};
