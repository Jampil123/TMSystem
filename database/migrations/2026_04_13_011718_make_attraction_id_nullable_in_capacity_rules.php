<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('capacity_rules', function (Blueprint $table) {
            // Make attraction_id nullable to allow global/default capacity rules
            $table->foreignId('attraction_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('capacity_rules', function (Blueprint $table) {
            $table->foreignId('attraction_id')->nullable(false)->change();
        });
    }
};
