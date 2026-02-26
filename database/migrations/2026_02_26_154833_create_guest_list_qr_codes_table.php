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
        Schema::create('guest_list_qr_codes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('guest_list_id');
            $table->string('token')->unique(); // Unique QR code token
            $table->enum('status', ['Unused', 'Used', 'Expired'])->default('Unused');
            $table->date('expiration_date');
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
            
            // Foreign key
            $table->foreign('guest_list_id')->references('id')->on('guest_lists')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_list_qr_codes');
    }
};
