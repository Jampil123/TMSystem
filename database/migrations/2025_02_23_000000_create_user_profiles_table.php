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
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->cascadeOnDelete();

            // business information
            $table->string('business_name')->nullable();
            $table->string('operator_type')->nullable();
            $table->text('description')->nullable();
            $table->integer('years_of_operation')->nullable();

            // contact details
            $table->string('contact_name')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('lgu_area')->nullable();

            // profile picture
            $table->string('profile_picture')->nullable();

            // accreditation
            $table->string('accreditation_status')->default('Pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
