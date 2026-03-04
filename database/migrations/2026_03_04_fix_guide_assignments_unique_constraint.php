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
        Schema::table('guide_assignments', function (Blueprint $table) {
            // Drop the old unique constraint (only allow one per guest list)
            $table->dropUnique(['guest_list_id']);
            
            // Add new unique constraint: same guide can't be assigned twice to same guest list
            $table->unique(['guest_list_id', 'guide_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guide_assignments', function (Blueprint $table) {
            $table->dropUnique(['guest_list_id', 'guide_id']);
            $table->unique(['guest_list_id']);
        });
    }
};
