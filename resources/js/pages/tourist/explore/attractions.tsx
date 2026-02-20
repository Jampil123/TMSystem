import { Head } from '@inertiajs/react';
import TouristLayout from '@/layouts/app/tourist-layout';
import { MapPin, Star } from 'lucide-react';

interface Attraction {
    id: number;
    title: string;
    description: string;
    location: string;
    rating: number;
    price: string;
    image: string;
    category?: string;
}

interface Props {
    attractions: {
        data: Attraction[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function ExploreAttractions({ attractions }: Props) {
    return (
        <TouristLayout>
            <Head title="Explore Attractions" />
            <div className="min-h-screen bg-[#E3EED4] dark:bg-[#0F2A1D] p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-[#0F2A1D] dark:text-white mb-2">
                            Explore Attractions
                        </h1>
                        <p className="text-[#6B8071] dark:text-[#AEC3B0]">
                            Discover amazing attractions and landmarks
                        </p>
                    </div>

                    {/* Attractions Grid */}
                    {attractions.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {attractions.data.map((attraction) => (
                                <div
                                    key={attraction.id}
                                    className="rounded-xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                                        <img
                                            src={attraction.image}
                                            alt={attraction.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 right-3 bg-white dark:bg-[#0F2A1D] px-3 py-1 rounded-lg shadow-md flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                            <span className="text-sm font-semibold text-[#0F2A1D] dark:text-white">
                                                {attraction.rating}
                                            </span>
                                        </div>
                                        {attraction.category && (
                                            <div className="absolute top-3 left-3 bg-[#C84B59] dark:bg-[#C84B59] text-white px-3 py-1 rounded-lg text-xs font-medium">
                                                {attraction.category}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-[#0F2A1D] dark:text-white text-lg mb-2 line-clamp-2">
                                            {attraction.title}
                                        </h3>

                                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-3 line-clamp-2">
                                            {attraction.description}
                                        </p>

                                        {/* Location */}
                                        <div className="flex items-center gap-1 text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-3">
                                            <MapPin className="w-3 h-3" />
                                            <span className="line-clamp-1">{attraction.location}</span>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                            <span className="text-lg font-bold text-[#C84B59] dark:text-[#E89BA3]">
                                                {attraction.price}
                                            </span>
                                            <button className="px-4 py-2 bg-[#C84B59] dark:bg-[#C84B59] text-white text-sm font-medium rounded-lg hover:bg-[#B03A47] transition-colors">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-12 text-center">
                            <p className="text-[#6B8071] dark:text-[#AEC3B0] text-lg">No attractions available</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {attractions.last_page > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button className="px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 text-[#0F2A1D] dark:text-white hover:bg-white dark:hover:bg-[#375534]/30 transition-colors">
                                Previous
                            </button>

                            {Array.from({ length: attractions.last_page }, (_, i) => (
                                <button
                                    key={i + 1}
                                    className={`px-3 py-2 rounded-lg transition-colors ${
                                        attractions.current_page === i + 1
                                            ? 'bg-[#C84B59] text-white'
                                            : 'border border-[#AEC3B0]/40 dark:border-[#375534]/40 text-[#0F2A1D] dark:text-white hover:bg-white dark:hover:bg-[#375534]/30'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button className="px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 text-[#0F2A1D] dark:text-white hover:bg-white dark:hover:bg-[#375534]/30 transition-colors">
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </TouristLayout>
    );
}
