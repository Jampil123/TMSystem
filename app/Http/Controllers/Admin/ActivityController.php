<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityFaq;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityController extends Controller
{
    public function index()
    {
        $activities = Activity::with('faqs')->get();
        
        return Inertia::render('admin/activities/index', [
            'activities' => $activities,
            'stats' => [
                'total_activities' => Activity::count(),
                'active_activities' => Activity::where('status', 'active')->count(),
                'inactive_activities' => Activity::where('status', 'inactive')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'duration' => 'required|string|max:100',
            'difficulty_level' => 'required|string|max:50',
            'max_participants' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'package_information' => 'nullable|array',
            'package_information.whats_included' => 'nullable|string',
            'package_information.what_to_bring' => 'nullable|string',
            'package_information.what_to_expect' => 'nullable|string',
            'package_information.cost_details' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'faqs' => 'nullable|array',
            'faqs.*.question' => 'required_with:faqs|string',
            'faqs.*.answer' => 'required_with:faqs|string',
        ]);

        $faqs = $validated['faqs'] ?? [];
        unset($validated['faqs']);

        $activity = Activity::create($validated);

        if (!empty($faqs)) {
            foreach ($faqs as $index => $faq) {
                if (!empty($faq['question']) && !empty($faq['answer'])) {
                    ActivityFaq::create([
                        'activity_id' => $activity->id,
                        'question' => $faq['question'],
                        'answer' => $faq['answer'],
                        'order' => $index,
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Activity created successfully');
    }

    public function update(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'duration' => 'required|string|max:100',
            'difficulty_level' => 'required|string|max:50',
            'max_participants' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'package_information' => 'nullable|array',
            'package_information.whats_included' => 'nullable|string',
            'package_information.what_to_bring' => 'nullable|string',
            'package_information.what_to_expect' => 'nullable|string',
            'package_information.cost_details' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'faqs' => 'nullable|array',
            'faqs.*.question' => 'required_with:faqs|string',
            'faqs.*.answer' => 'required_with:faqs|string',
        ]);

        $faqs = $validated['faqs'] ?? [];
        unset($validated['faqs']);

        $activity->update($validated);

        // Delete existing FAQs and create new ones
        $activity->faqs()->delete();
        
        if (!empty($faqs)) {
            foreach ($faqs as $index => $faq) {
                if (!empty($faq['question']) && !empty($faq['answer'])) {
                    ActivityFaq::create([
                        'activity_id' => $activity->id,
                        'question' => $faq['question'],
                        'answer' => $faq['answer'],
                        'order' => $index,
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Activity updated successfully');
    }

    public function destroy(Activity $activity)
    {
        $activity->delete();

        return redirect()->back()->with('success', 'Activity deleted successfully');
    }
}
