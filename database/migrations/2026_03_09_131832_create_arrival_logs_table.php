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
        Schema::create('arrival_logs', function (Blueprint $table) {
            $table->id('log_id');
            $table->unsignedBigInteger('guest_list_id')->nullable();
            $table->string('guest_name');
            $table->unsignedBigInteger('guide_id')->nullable();
            $table->time('arrival_time');
            $table->date('arrival_date');
            $table->decimal('fee_paid', 8, 2)->default(0.00);
            $table->enum('status', ['arrived', 'denied'])->default('arrived');
            $table->timestamps();

            // Foreign keys
            $table->foreign('guest_list_id')->references('id')->on('guest_lists')->onDelete('cascade');
            $table->foreign('guide_id')->references('id')->on('guides')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('arrival_logs');
    }
};
