import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Star, Heart, Share2, MapPin, Calendar, Ticket } from 'lucide-react';
import { useState } from 'react';
import PortalHeader from '@/components/portal-header';

interface Activity {
    id: number;
    name: string;
    duration: string;
    difficulty_level?: string;
    description?: string;
    max_participants?: number | null;
    price?: number | null;
    image_url?: string | null;
    rating?: number | null;
    status?: string;
}

interface Attraction {
    id: number;
    name: string;
    description: string;
    location: string;
    category: string;
    entry_fee: number | null;
    image_url: string | null;
    rating: number | null;
    status: string;
    best_time_to_visit?: string;
}

interface PageProps {
    attraction: Attraction;
    attractions: Attraction[];
    activities: Activity[];
}

export default function AttractionDetail({ attraction, attractions = [], activities = [] }: PageProps) {
    const [isLiked, setIsLiked] = useState(false);

    const getCategoryColor = (category: string) => {
        const categoryMap: Record<string, string> = {
            'beach': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'nature': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'cultural': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            'adventure': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            'scenic': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
            'water sports': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
        };
        return categoryMap[category.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    };

    return (
        <>
            <Head title={`${attraction.name} - Attraction Details`} />

            {/* Portal Header */}
            <PortalHeader activities={activities} attractions={attractions} />

            {/* Attraction Detail Section */}
            <div className="bg-white dark:bg-[#0F2A1D] min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    {/* Hero Image */}
                    <div className="mb-8 rounded-3xl overflow-hidden shadow-2xl h-96 bg-gray-200">
                        <img
                            src={attraction.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop'}
                            alt={attraction.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Title Section */}
                            <div className="mb-8">
                                <h1 className="text-5xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                    {attraction.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    {/* Rating */}
                                    {attraction.rating && (
                                        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-lg">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${
                                                            i < Math.floor(attraction.rating!)
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300 dark:text-gray-600'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                                {attraction.rating}/5
                                            </span>
                                        </div>
                                    )}

                                    {/* Category Badge */}
                                    <div className={`px-4 py-2 rounded-lg font-semibold capitalize ${getCategoryColor(attraction.category)}`}>
                                        {attraction.category}
                                    </div>
                                </div>
                            </div>

                            {/* Attraction Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                                {/* Location */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Location</span>
                                    </div>
                                    <p className="text-lg font-bold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        {attraction.location}
                                    </p>
                                </div>

                                {/* Category */}
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Ticket className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Category</span>
                                    </div>
                                    <p className="text-lg font-bold text-[#0F2A1D] dark:text-[#E3EED4] capitalize">
                                        {attraction.category}
                                    </p>
                                </div>

                                {/* Entry Fee */}
                                {attraction.entry_fee && attraction.entry_fee > 0 && (
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 p-6 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Ticket className="w-6 h-6 text-green-600 dark:text-green-400" />
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Entry Fee</span>
                                        </div>
                                        <p className="text-lg font-bold text-[#0F2A1D] dark:text-[#E3EED4]">
                                            ₱{parseFloat(attraction.entry_fee.toString()).toFixed(2)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-12">
                                <h2 className="text-3xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                    About This Attraction
                                </h2>
                                <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0] leading-relaxed whitespace-pre-wrap">
                                    {attraction.description}
                                </p>
                            </div>

                            {/* Best Time to Visit */}
                            <div className="bg-gradient-to-r from-[#375534]/10 to-[#0F2A1D]/10 dark:from-[#375534]/20 dark:to-[#0F2A1D]/20 p-8 rounded-2xl mb-12">
                                <h3 className="text-2xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-4 flex items-center gap-2">
                                    <Calendar className="w-6 h-6" />
                                    Best Time to Visit
                                </h3>
                                <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0] leading-relaxed">
                                    {attraction.best_time_to_visit || 'Year-round destination with pleasant weather. Check local conditions before planning your visit.'}
                                </p>
                            </div>

                            {/* Visitor Tips */}
                            <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 p-8 rounded-2xl">
                                <h3 className="text-2xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                    Visitor Tips
                                </h3>
                                <ul className="space-y-3 text-lg text-[#6B8071] dark:text-[#AEC3B0]">
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#375534] dark:text-[#AEC3B0] font-bold">✓</span>
                                        <span>Wear comfortable shoes for walking and exploring</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#375534] dark:text-[#AEC3B0] font-bold">✓</span>
                                        <span>Bring sun protection including sunscreen and hat</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#375534] dark:text-[#AEC3B0] font-bold">✓</span>
                                        <span>Plan for 2-4 hours to fully experience the attraction</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#375534] dark:text-[#AEC3B0] font-bold">✓</span>
                                        <span>Check local facilities and amenities available</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            {/* Info Card */}
                            <div className="bg-gradient-to-br from-[#375534] to-[#0F2A1D] rounded-3xl p-8 sticky top-24 shadow-2xl">
                                <h3 className="text-2xl font-bold text-white mb-6">About This Attraction</h3>

                                {attraction.entry_fee && attraction.entry_fee > 0 && (
                                    <div className="mb-6 pb-6 border-b border-white/20">
                                        <p className="text-[#AEC3B0] text-sm mb-2">Entry Fee</p>
                                        <p className="text-4xl font-bold text-white">
                                            ₱{parseFloat(attraction.entry_fee.toString()).toFixed(2)}
                                        </p>
                                    </div>
                                )}

                                <button 
                                    onClick={() => setIsLiked(!isLiked)}
                                    className="w-full py-3 border-2 border-white text-white hover:bg-white/10 font-bold rounded-xl transition mb-4 flex items-center justify-center gap-2"
                                >
                                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                                    Save Attraction
                                </button>

                                <button className="w-full py-3 border-2 border-white text-white hover:bg-white/10 font-bold rounded-xl transition flex items-center justify-center gap-2">
                                    <Share2 className="w-5 h-5" />
                                    Share
                                </button>

                                {/* Info Cards */}
                                <div className="mt-8 space-y-4">
                                    <div className="bg-white/10 p-4 rounded-xl">
                                        <p className="text-[#AEC3B0] text-sm mb-1">Category</p>
                                        <p className="text-white font-bold capitalize">{attraction.category}</p>
                                    </div>

                                    <div className="bg-white/10 p-4 rounded-xl">
                                        <p className="text-[#AEC3B0] text-sm mb-1">Location</p>
                                        <p className="text-white font-bold">{attraction.location}</p>
                                    </div>

                                    {attraction.rating && (
                                        <div className="bg-white/10 p-4 rounded-xl">
                                            <p className="text-[#AEC3B0] text-sm mb-1">Rating</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${
                                                                i < Math.floor(attraction.rating!)
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-400'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-white font-bold">{attraction.rating}/5</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
