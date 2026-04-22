import { Head } from '@inertiajs/react';
import TouristLayout from '@/layouts/app/tourist-layout';
import { MapPin, Star, Sparkles } from 'lucide-react';

interface Accommodation {
    id: number;
    title: string;
    description: string;
    location: string;
    rating: number;
    image: string;
    type?: string;
    price?: string;
}

interface Props {
    accommodations: {
        data: Accommodation[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function ExploreAccommodations({ accommodations }: Props) {
    return (
        <TouristLayout>
            <Head title="Explore Accommodations" />
            <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] via-[#E3EED4] to-[#AEC3B0]/20 dark:bg-gradient-to-br dark:from-[#0F2A1D] dark:via-[#0F2A1D] dark:to-[#375534]/20 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header with Background Accent */}
                    <div className="mb-12 relative">
                        <div className="absolute -top-8 -left-6 w-32 h-32 bg-[#375534]/5 dark:bg-[#375534]/10 rounded-full blur-3xl"></div>
                        <div className="relative">
                            <h1 className="text-5xl font-bold text-[#0F2A1D] dark:text-white mb-3 bg-gradient-to-r from-[#0F2A1D] to-[#375534] dark:from-white dark:to-[#AEC3B0] bg-clip-text text-transparent">
                                Explore Accommodations
                            </h1>
                            <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0] font-medium">
                                Find the perfect place to stay for your unforgettable journey
                            </p>
                        </div>
                    </div>

                    {/* Accommodations Grid */}
                    {accommodations.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {accommodations.data.map((accommodation) => (
                                <div
                                    key={accommodation.id}
                                    className="rounded-xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                                        <img
                                            src={accommodation.image}
                                            alt={accommodation.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 right-3 bg-white dark:bg-[#0F2A1D] px-3 py-1 rounded-lg shadow-md flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                            <span className="text-sm font-semibold text-[#0F2A1D] dark:text-white">
                                                {accommodation.rating}
                                            </span>
                                        </div>
                                        {accommodation.type && (
                                            <div className="absolute top-3 left-3 bg-[#375534] dark:bg-[#375534] text-white px-3 py-1 rounded-lg text-xs font-medium">
                                                {accommodation.type}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-[#0F2A1D] dark:text-white text-lg mb-2 line-clamp-2">
                                            {accommodation.title}
                                        </h3>

                                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-3 line-clamp-2">
                                            {accommodation.description}
                                        </p>

                                        {/* Location */}
                                        <div className="flex items-center gap-1 text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-4">
                                            <MapPin className="w-3 h-3" />
                                            <span className="line-clamp-1">{accommodation.location}</span>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                            <span className="text-lg font-bold text-[#375534] dark:text-[#AEC3B0]">
                                                {accommodation.price || 'Contact'}
                                            </span>
                                            <button className="px-4 py-2 bg-[#375534] dark:bg-[#375534] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a2a] transition-colors">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-12 text-center">
                            <p className="text-[#6B8071] dark:text-[#AEC3B0] text-lg">No accommodations available</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {accommodations.last_page > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button className="px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 text-[#0F2A1D] dark:text-white hover:bg-white dark:hover:bg-[#375534]/30 transition-colors">
                                Previous
                            </button>

                            {Array.from({ length: accommodations.last_page }, (_, i) => (
                                <button
                                    key={i + 1}
                                    className={`px-3 py-2 rounded-lg transition-colors ${
                                        accommodations.current_page === i + 1
                                            ? 'bg-[#375534] text-white'
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
