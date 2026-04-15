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
        Schema::table('guest_lists', function (Blueprint $table) {
            // Add attraction_id for walk-in guests
            $table->unsignedBigInteger('attraction_id')->nullable()->after('service_id');
            
            // Make service_id nullable since walk-ins use attraction_id instead
            $table->unsignedBigInteger('service_id')->nullable()->change();
            
            // Add foreign key for attraction_id
            $table->foreign('attraction_id')->references('id')->on('attractions')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guest_lists', function (Blueprint $table) {
            $table->dropForeign(['attraction_id']);
            $table->dropColumn('attraction_id');
            
            // Restore service_id as not nullable
            $table->unsignedBigInteger('service_id')->nullable(false)->change();
        });
    }
};
