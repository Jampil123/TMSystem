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
        // Add "Adventure" to all guides' specialty areas
        $guides = DB::table('guides')->get();
        
        foreach ($guides as $guide) {
            $specialties = $guide->specialty_areas 
                ? (is_string($guide->specialty_areas) 
                    ? json_decode($guide->specialty_areas, true) 
                    : $guide->specialty_areas)
                : [];
            
            // Ensure it's an array
            if (!is_array($specialties)) {
                $specialties = [];
            }
            
            // Add Adventure if not already there
            if (!in_array('Adventure', $specialties, true)) {
                $specialties[] = 'Adventure';
            }
            
            DB::table('guides')
                ->where('id', $guide->id)
                ->update(['specialty_areas' => json_encode($specialties)]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove "Adventure" from all guides' specialty areas
        $guides = DB::table('guides')->get();
        
        foreach ($guides as $guide) {
            $specialties = $guide->specialty_areas 
                ? (is_string($guide->specialty_areas) 
                    ? json_decode($guide->specialty_areas, true) 
                    : $guide->specialty_areas)
                : [];
            
            if (is_array($specialties)) {
                $specialties = array_filter($specialties, fn($s) => $s !== 'Adventure');
                DB::table('guides')
                    ->where('id', $guide->id)
                    ->update(['specialty_areas' => json_encode(array_values($specialties))]);
            }
        }
    }
};
