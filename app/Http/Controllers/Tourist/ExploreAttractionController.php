<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Attraction;
use Inertia\Inertia;

class ExploreAttractionController extends Controller
{
    public function index()
    {
        $attractions = Attraction::where('status', 'active')
            ->select('id', 'name', 'description', 'location', 'rating', 'entry_fee', 'image_url', 'category')
            ->paginate(12);

        return Inertia::render('tourist/explore/attractions', [
            'attractions' => $attractions->through(fn ($attraction) => [
                'id' => $attraction->id,
                'title' => $attraction->name,
                'description' => $attraction->description,
                'location' => $attraction->location,
                'rating' => $attraction->rating ?? 0,
                'price' => '₱' . ($attraction->entry_fee ?? '0'),
                'image' => $attraction->image_url,
                'category' => $attraction->category,
            ]),
        ]);
    }
}
