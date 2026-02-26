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
        Schema::create('activity', function (Blueprint $table) {
            $table->id('activity_id');
            $table->foreignId('service_id')->unique()->constrained('services', 'service_id')->onDelete('cascade');
            $table->decimal('price_per_person', 10, 2);
            $table->integer('duration_minutes');
            $table->integer('max_participants');
            $table->text('required_equipment')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity');
    }
};
