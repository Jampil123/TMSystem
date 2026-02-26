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
        Schema::create('accommodation', function (Blueprint $table) {
            $table->id('accommodation_id');
            $table->foreignId('service_id')->unique()->constrained('services', 'service_id')->onDelete('cascade');
            $table->string('room_type');
            $table->integer('capacity');
            $table->decimal('price_per_night', 10, 2);
            $table->integer('total_rooms');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accommodation');
    }
};
