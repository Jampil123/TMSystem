import { Head } from '@inertiajs/react';
import TouristLayout from '@/layouts/app/tourist-layout';
import { MapPin, Star, Sparkles, Clock } from 'lucide-react';

interface Activity {
    id: number;
    title: string;
    description: string;
    duration: string;
    difficulty: string;
    rating: number;
    price: string;
    image: string;
}

interface Props {
    activities: {
        data: Activity[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function ExploreActivities({ activities }: Props) {
    return (
        <TouristLayout>
            <Head title="Explore Activities" />
            <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] via-[#E3EED4] to-[#AEC3B0]/20 dark:bg-gradient-to-br dark:from-[#0F2A1D] dark:via-[#0F2A1D] dark:to-[#375534]/20 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header with Background Accent */}
                    <div className="mb-12 relative">
                        <div className="absolute -top-8 -left-6 w-32 h-32 bg-[#375534]/5 dark:bg-[#375534]/10 rounded-full blur-3xl"></div>
                        <div className="relative">
                            <h1 className="text-5xl font-bold text-[#0F2A1D] dark:text-white mb-3 bg-gradient-to-r from-[#0F2A1D] to-[#375534] dark:from-white dark:to-[#AEC3B0] bg-clip-text text-transparent">
                                Explore Activities
                            </h1>
                            <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0] font-medium">
                                Discover exciting activities and experiences waiting for you
                            </p>
                        </div>
                    </div>

                    {/* Activities Grid */}
                    {activities.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activities.data.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="group rounded-2xl border border-[#AEC3B0]/30 dark:border-[#375534]/30 bg-white dark:bg-[#1a3a2e] shadow-sm hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer overflow-hidden hover:border-[#375534]/50 dark:hover:border-[#AEC3B0]/50 hover:scale-105 transform"
                                >
                                    {/* Image Container */}
                                    <div className="relative h-56 bg-gray-300 overflow-hidden">
                                        <img
                                            src={activity.image}
                                            alt={activity.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2A1D]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        
                                        {/* Rating Badge */}
                                        <div className="absolute top-4 right-4 bg-white dark:bg-[#0F2A1D] px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transform group-hover:scale-110 transition-transform duration-300">
                                            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                            <span className="text-sm font-bold text-[#0F2A1D] dark:text-white">
                                                {activity.rating}
                                            </span>
                                        </div>
                                        
                                        {/* Difficulty Badge */}
                                        <div className="absolute top-4 left-4 bg-gradient-to-r from-[#375534] to-[#2d4a2a] dark:from-[#375534] dark:to-[#2d4a2a] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                            {activity.difficulty}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <h3 className="font-bold text-[#0F2A1D] dark:text-white text-xl mb-2 line-clamp-2 group-hover:text-[#375534] dark:group-hover:text-[#AEC3B0] transition-colors">
                                                {activity.title}
                                            </h3>

                                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] line-clamp-2 leading-relaxed">
                                                {activity.description}
                                            </p>
                                        </div>

                                        {/* Duration */}
                                        <div className="flex items-center gap-2 text-sm text-[#375534] dark:text-[#AEC3B0] pt-2 font-medium">
                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                            <span>{activity.duration}</span>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-[#AEC3B0]/20 dark:border-[#375534]/30">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-[#6B8071] dark:text-[#AEC3B0] font-medium">Price</span>
                                                <span className="text-2xl font-bold text-[#375534] dark:text-[#AEC3B0]">
                                                    {activity.price}
                                                </span>
                                            </div>
                                            <button className="px-6 py-2.5 bg-gradient-to-r from-[#375534] to-[#2d4a2a] dark:from-[#375534] dark:to-[#2d4a2a] text-white text-sm font-bold rounded-lg hover:shadow-lg hover:from-[#2d4a2a] hover:to-[#1f3620] transition-all duration-300 transform group-hover:scale-105 uppercase tracking-wide">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-gradient-to-br from-white to-[#E3EED4]/30 dark:from-[#1a3a2e] dark:to-[#375534]/20 shadow-sm p-16 text-center">
                            <div className="mb-4">
                                <Sparkles className="w-12 h-12 text-[#6B8071] dark:text-[#AEC3B0] mx-auto opacity-50" />
                            </div>
                            <p className="text-[#6B8071] dark:text-[#AEC3B0] text-lg font-medium">No activities available at the moment</p>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] opacity-75 mt-2">Check back soon for new adventures!</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {activities.last_page > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button className="px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 text-[#0F2A1D] dark:text-white hover:bg-white dark:hover:bg-[#375534]/30 transition-colors">
                                Previous
                            </button>

                            {Array.from({ length: activities.last_page }, (_, i) => (
                                <button
                                    key={i + 1}
                                    className={`px-3 py-2 rounded-lg transition-colors ${
                                        activities.current_page === i + 1
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
