import { Head } from '@inertiajs/react';
import TouristLayout from '@/layouts/app/tourist-layout';
import { MapPin, Star, Clock, Users, Search, Filter } from 'lucide-react';
import { useState } from 'react';

interface Activity {
    id: number;
    title: string;
    location: string;
    price: string;
    rating: number;
    duration: string;
    capacity: number;
    image: string;
    description: string;
}

interface Props {
    activities: {
        data: Activity[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function Activities({ activities }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredActivities, setFilteredActivities] = useState(activities.data);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredActivities(activities.data);
        } else {
            setFilteredActivities(
                activities.data.filter(
                    (activity) =>
                        activity.title.toLowerCase().includes(query.toLowerCase()) ||
                        activity.location.toLowerCase().includes(query.toLowerCase())
                )
            );
        }
    };

    return (
        <TouristLayout>
            <Head title="Activities" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#375534] to-[#6B8071] p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Activities & Experiences</h1>
                    <p className="text-[#E3EED4]">Discover exciting activities and adventures tailored for you</p>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B8071] dark:text-[#AEC3B0]" />
                        <input
                            type="text"
                            placeholder="Search activities..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-white placeholder-[#6B8071] dark:placeholder-[#AEC3B0] focus:outline-none focus:ring-2 focus:ring-[#C84B59]/50"
                        />
                    </div>
                    <button className="px-6 py-3 rounded-lg bg-white dark:bg-[#1a3a2e] border border-[#AEC3B0]/40 dark:border-[#375534]/40 text-[#0F2A1D] dark:text-white font-medium hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 transition-colors flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filter
                    </button>
                </div>

                {/* Activities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredActivities.map((activity) => (
                        <div
                            key={activity.id}
                            className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            {/* Image */}
                            <div className="relative h-48 bg-gray-200">
                                <img
                                    src={activity.image}
                                    alt={activity.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3 bg-white dark:bg-[#0F2A1D] px-3 py-1 rounded-lg shadow-sm flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    <span className="text-sm font-medium text-[#0F2A1D] dark:text-white">{activity.rating}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-2">{activity.title}</h3>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-4 line-clamp-2">{activity.description}</p>

                                {/* Details */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                        <MapPin className="w-4 h-4" />
                                        {activity.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                        <Clock className="w-4 h-4" />
                                        {activity.duration}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                        <Users className="w-4 h-4" />
                                        {activity.capacity} people max
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <p className="text-[#C84B59] dark:text-[#E89BA3] font-semibold">{activity.price}</p>
                                    <button className="px-4 py-2 rounded-lg bg-[#375534] text-white hover:bg-[#2d4227] transition-colors font-medium text-sm">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {filteredActivities.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-[#6B8071] dark:text-[#AEC3B0]">No activities found matching your search.</p>
                    </div>
                )}
            </div>
        </TouristLayout>
    );
}


