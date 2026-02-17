import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, TrendingUp, Users, Zap, Star, Heart, Share2, MapPin } from 'lucide-react';
import { useState } from 'react';
import PortalHeader from '@/components/portal-header';

interface Activity {
    id: number;
    name: string;
    description: string;
    duration: string;
    difficulty_level: string;
    max_participants: number | null;
    price: number | null;
    image_url: string | null;
    rating: number | null;
    status: string;
    package_information?: {
        whats_included?: string;
        what_to_bring?: string;
        what_to_expect?: string;
        cost_details?: string;
    } | null;
    faqs?: Array<{
        id: number;
        question: string;
        answer: string;
        order: number;
    }>;
    created_at: string;
    updated_at: string;
}

interface Attraction {
    id: number;
    name: string;
    description: string;
    location: string;
    category: string;
    price: number | null;
    image_url: string | null;
    rating: number | null;
    status: string;
}

interface PageProps {
    activity: Activity;
    activities: Activity[];
    attractions: Attraction[];
}

export default function ActivityDetail({ activity, activities = [], attractions = [] }: PageProps) {
    const [isLiked, setIsLiked] = useState(false);

    const getDifficultyColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'easy':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'hard':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    return (
        <>
            <Head title={`${activity.name} - Activity Details`} />

            {/* Portal Header */}
            <PortalHeader activities={activities} attractions={attractions} />

            {/* Activity Detail Section */}
            <div className="bg-white dark:bg-[#0F2A1D] min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    {/* Hero Image */}
                    <div className="mb-8 rounded-3xl overflow-hidden shadow-2xl h-96 bg-gray-200">
                        <img
                            src={activity.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop'}
                            alt={activity.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Title Section */}
                            <div className="mb-8">
                                <h1 className="text-5xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                    {activity.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    {/* Rating */}
                                    {activity.rating && (
                                        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-lg">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${
                                                            i < Math.floor(activity.rating!)
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300 dark:text-gray-600'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                                {activity.rating}/5
                                            </span>
                                        </div>
                                    )}

                                    {/* Difficulty Badge */}
                                    <div className={`px-4 py-2 rounded-lg font-semibold ${getDifficultyColor(activity.difficulty_level)}`}>
                                        {activity.difficulty_level}
                                    </div>
                                </div>
                            </div>

                            {/* Activity Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                                {/* Duration */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Duration</span>
                                    </div>
                                    <p className="text-xl font-bold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        {activity.duration}
                                    </p>
                                </div>

                                {/* Difficulty */}
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Difficulty</span>
                                    </div>
                                    <p className="text-xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] capitalize">
                                        {activity.difficulty_level}
                                    </p>
                                </div>

                                {/* Capacity */}
                                {activity.max_participants && (
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 p-6 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Max People</span>
                                        </div>
                                        <p className="text-xl font-bold text-[#0F2A1D] dark:text-[#E3EED4]">
                                            {activity.max_participants}
                                        </p>
                                    </div>
                                )}

                                {/* Price */}
                                {activity.price && activity.price > 0 && (
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 p-6 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Price</span>
                                        </div>
                                        <p className="text-xl font-bold text-[#0F2A1D] dark:text-[#E3EED4]">
                                            ₱{parseFloat(activity.price.toString()).toFixed(2)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-12">
                                <h2 className="text-3xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                    About This Activity
                                </h2>
                                <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0] leading-relaxed whitespace-pre-wrap">
                                    {activity.description}
                                </p>
                            </div>

                            {/* Package Information Sections */}
                            {activity.package_information && (
                                <>
                                    {activity.package_information.whats_included && (
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-8 rounded-2xl mb-8">
                                            <h3 className="text-2xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-4 flex items-center gap-2">
                                                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                What's Included
                                            </h3>
                                            <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0] leading-relaxed whitespace-pre-wrap">
                                                {activity.package_information.whats_included}
                                            </p>
                                        </div>
                                    )}

                                    {activity.package_information.what_to_bring && (
                                        <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 p-8 rounded-2xl mb-8">
                                            <h3 className="text-2xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-4 flex items-center gap-2">
                                                <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                                What to Bring
                                            </h3>
                                            <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0] leading-relaxed whitespace-pre-wrap">
                                                {activity.package_information.what_to_bring}
                                            </p>
                                        </div>
                                    )}

                                    {activity.package_information.cost_details && (
                                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 p-8 rounded-2xl mb-8">
                                            <h3 className="text-2xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-4 flex items-center gap-2">
                                                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                                                Cost Details
                                            </h3>
                                            <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0] leading-relaxed whitespace-pre-wrap">
                                                {activity.package_information.cost_details}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* What to Expect */}
                            <div className="bg-gradient-to-r from-[#375534]/10 to-[#0F2A1D]/10 dark:from-[#375534]/20 dark:to-[#0F2A1D]/20 p-8 rounded-2xl">
                                <h3 className="text-2xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                    What to Expect
                                </h3>
                                <div className="text-lg text-[#6B8071] dark:text-[#AEC3B0] leading-relaxed whitespace-pre-wrap">
                                    {activity.package_information?.what_to_expect || (
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#375534] dark:text-[#AEC3B0] font-bold">✓</span>
                                                <span>Professional guides and equipment provided</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#375534] dark:text-[#AEC3B0] font-bold">✓</span>
                                                <span>Safe and secure experience with certified staff</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#375534] dark:text-[#AEC3B0] font-bold">✓</span>
                                                <span>Flexible scheduling and group availability</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#375534] dark:text-[#AEC3B0] font-bold">✓</span>
                                                <span>Memorable experience in beautiful Badian</span>
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Frequently Asked Questions - Card Layout */}
                            {activity.faqs && activity.faqs.length > 0 && (
                                <div className="mt-12 space-y-6">
                                    {activity.faqs.map((faq) => (
                                        <div
                                            key={faq.id}
                                            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-800/20 p-8 rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-[#375534]/30 dark:hover:border-[#375534]/50 transition"
                                        >
                                            <h3 className="text-2xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-6">
                                                {faq.question}
                                            </h3>
                                            <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0] leading-relaxed whitespace-pre-wrap">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            {/* Info Card */}
                            <div className="bg-gradient-to-br from-[#375534] to-[#0F2A1D] rounded-3xl p-8 sticky top-24 shadow-2xl">
                                <h3 className="text-2xl font-bold text-white mb-6">About This Activity</h3>

                                {activity.price && activity.price > 0 && (
                                    <div className="mb-6 pb-6 border-b border-white/20">
                                        <p className="text-[#AEC3B0] text-sm mb-2">Price</p>
                                        <p className="text-4xl font-bold text-white">
                                            ₱{parseFloat(activity.price.toString()).toFixed(2)}
                                        </p>
                                    </div>
                                )}

                                <button className="w-full py-3 border-2 border-white text-white hover:bg-white/10 font-bold rounded-xl transition mb-4 flex items-center justify-center gap-2">
                                    <Heart className="w-5 h-5" />
                                    Save Activity
                                </button>

                                <button className="w-full py-3 border-2 border-white text-white hover:bg-white/10 font-bold rounded-xl transition flex items-center justify-center gap-2">
                                    <Share2 className="w-5 h-5" />
                                    Share
                                </button>

                                {/* Info Cards */}
                                <div className="mt-8 space-y-4">
                                    <div className="bg-white/10 p-4 rounded-xl">
                                        <p className="text-[#AEC3B0] text-sm mb-1">Duration</p>
                                        <p className="text-white font-bold">{activity.duration}</p>
                                    </div>

                                    {activity.max_participants && (
                                        <div className="bg-white/10 p-4 rounded-xl">
                                            <p className="text-[#AEC3B0] text-sm mb-1">Group Size</p>
                                            <p className="text-white font-bold">Up to {activity.max_participants} people</p>
                                        </div>
                                    )}

                                    <div className="bg-white/10 p-4 rounded-xl">
                                        <p className="text-[#AEC3B0] text-sm mb-1">Level</p>
                                        <p className="text-white font-bold capitalize">{activity.difficulty_level}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
