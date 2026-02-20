<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use Inertia\Inertia;

class ExploreAccommodationController extends Controller
{
    public function index()
    {
        $accommodations = Accommodation::where('status', 'active')
            ->select('id', 'name', 'description', 'location', 'rating', 'image_url', 'type')
            ->paginate(12);

        return Inertia::render('tourist/explore/accommodations', [
            'accommodations' => $accommodations->through(fn ($accommodation) => [
                'id' => $accommodation->id,
                'title' => $accommodation->name,
                'description' => $accommodation->description,
                'location' => $accommodation->location,
                'rating' => $accommodation->rating ?? 0,
                'image' => $accommodation->image_url,
                'type' => $accommodation->type,
            ]),
        ]);
    }
}
