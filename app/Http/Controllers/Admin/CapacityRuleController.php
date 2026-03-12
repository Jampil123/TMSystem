<?php

namespace App\Http\Controllers\Admin;

use App\Models\CapacityRule;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CapacityRuleController extends Controller
{
    /**
     * Get current capacity rules
     */
    public function index()
    {
        try {
            $rules = CapacityRule::active();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $rules->id,
                    'max_visitors' => $rules->max_visitors,
                    'warning_threshold_percent' => $rules->warning_threshold_percent,
                    'critical_threshold_percent' => $rules->critical_threshold_percent,
                    'max_guests_per_guide' => $rules->max_guests_per_guide,
                    'max_daily_visitors' => $rules->max_daily_visitors,
                    'created_at' => $rules->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $rules->updated_at->format('Y-m-d H:i:s'),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching capacity rules: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching capacity rules',
            ], 500);
        }
    }

    /**
     * Update capacity rules
     */
    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
                'max_visitors' => 'required|integer|min:10|max:10000',
                'warning_threshold_percent' => 'required|integer|min:1|max:99',
                'critical_threshold_percent' => 'required|integer|min:1|max:100',
                'max_guests_per_guide' => 'required|integer|min:1|max:100',
                'max_daily_visitors' => 'required|integer|min:10|max:10000',
            ]);

            // Validate threshold logic
            if ($validated['warning_threshold_percent'] >= $validated['critical_threshold_percent']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Warning threshold must be less than critical threshold',
                    'errors' => [
                        'warning_threshold_percent' => ['Must be less than critical threshold'],
                    ],
                ], 422);
            }

            // Get or create the active rules
            $rules = CapacityRule::active();
            $rules->update($validated);

            // Log the update
            \Log::info('Capacity rules updated by admin', [
                'user_id' => auth()->id(),
                'rules' => $validated,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Capacity rules updated successfully',
                'data' => [
                    'id' => $rules->id,
                    'max_visitors' => $rules->max_visitors,
                    'warning_threshold_percent' => $rules->warning_threshold_percent,
                    'critical_threshold_percent' => $rules->critical_threshold_percent,
                    'max_guests_per_guide' => $rules->max_guests_per_guide,
                    'max_daily_visitors' => $rules->max_daily_visitors,
                    'created_at' => $rules->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $rules->updated_at->format('Y-m-d H:i:s'),
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating capacity rules: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating capacity rules',
            ], 500);
        }
    }

    /**
     * Get capacity rules history (for auditing)
     */
    public function history()
    {
        try {
            // Get all capacity rules with timestamps (could implement versioning)
            $rules = CapacityRule::orderBy('updated_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $rules->map(function ($rule) {
                    return [
                        'id' => $rule->id,
                        'max_visitors' => $rule->max_visitors,
                        'warning_threshold_percent' => $rule->warning_threshold_percent,
                        'critical_threshold_percent' => $rule->critical_threshold_percent,
                        'max_guests_per_guide' => $rule->max_guests_per_guide,
                        'max_daily_visitors' => $rule->max_daily_visitors,
                        'last_updated' => $rule->updated_at->format('Y-m-d H:i:s'),
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching capacity rules history: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching history',
            ], 500);
        }
    }

    /**
     * Reset rules to default values
     */
    public function reset()
    {
        try {
            $rules = CapacityRule::active();
            $rules->update([
                'max_visitors' => 350,
                'warning_threshold_percent' => 80,
                'critical_threshold_percent' => 100,
                'max_guests_per_guide' => 20,
                'max_daily_visitors' => 500,
            ]);

            \Log::info('Capacity rules reset to defaults by admin', [
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Capacity rules reset to defaults',
                'data' => [
                    'max_visitors' => $rules->max_visitors,
                    'warning_threshold_percent' => $rules->warning_threshold_percent,
                    'critical_threshold_percent' => $rules->critical_threshold_percent,
                    'max_guests_per_guide' => $rules->max_guests_per_guide,
                    'max_daily_visitors' => $rules->max_daily_visitors,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error resetting capacity rules: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error resetting capacity rules',
            ], 500);
        }
    }
}
