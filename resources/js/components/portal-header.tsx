import { Link } from '@inertiajs/react';
import { ChevronDown, Clock, MapPin } from 'lucide-react';

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
    location?: string;
    description?: string;
    best_time_to_visit?: string;
    entry_fee?: number | null;
    image_url?: string | null;
    rating?: number | null;
    status?: string;
}

interface PortalHeaderProps {
    activities?: Activity[];
    attractions?: Attraction[];
}

export default function PortalHeader({ activities = [], attractions = [] }: PortalHeaderProps) {
    return (
        <nav className="bg-white dark:bg-[#0F2A1D] shadow-lg sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link href="/portal" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#375534] to-[#0F2A1D] flex items-center justify-center">
                            <span className="text-white font-bold text-lg">B</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[#0F2A1D] dark:text-[#E3EED4]">BADIAN</h1>
                    </Link>
                    <div className="flex items-center gap-8">
                        <Link href="/portal" className="text-[#6B8071] dark:text-[#AEC3B0] hover:text-[#0F2A1D] dark:hover:text-white transition font-medium">
                            Home
                        </Link>
                        <Link href="/portal/about" className="text-[#6B8071] dark:text-[#AEC3B0] hover:text-[#0F2A1D] dark:hover:text-white transition font-medium">
                            About
                        </Link>
                        
                        {/* Activities Dropdown */}
                        <div className="relative group">
                            <button 
                                className="flex items-center gap-1 text-[#6B8071] dark:text-[#AEC3B0] hover:text-[#0F2A1D] dark:hover:text-white transition font-medium"
                            >
                                Activities
                                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                            </button>
                            
                            {/* Dropdown Menu */}
                            <div className="absolute left-0 mt-0 w-64 bg-white dark:bg-[#1F3A2F] rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-50 hidden group-hover:block">
                                {activities.length > 0 ? (
                                    <div className="py-2 max-h-96 overflow-y-auto">
                                        {activities.map((activity) => (
                                            <Link
                                                key={activity.id}
                                                href={`/portal/activity/${activity.id}`}
                                                className="block px-4 py-2 text-sm text-[#0F2A1D] dark:text-[#E3EED4] hover:bg-[#375534]/10 dark:hover:bg-[#375534]/30 transition flex items-start gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-semibold">{activity.name}</div>
                                                    <div className="text-xs text-[#6B8071] dark:text-[#AEC3B0] flex items-center gap-2 mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        {activity.duration}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-4 py-6 text-center text-[#6B8071] dark:text-[#AEC3B0]">
                                        No activities available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Attractions Dropdown */}
                        <div className="relative group">
                            <button 
                                className="flex items-center gap-1 text-[#6B8071] dark:text-[#AEC3B0] hover:text-[#0F2A1D] dark:hover:text-white transition font-medium"
                            >
                                Attractions
                                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                            </button>
                            
                            {/* Dropdown Menu */}
                            <div className="absolute left-0 mt-0 w-64 bg-white dark:bg-[#1F3A2F] rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-50 hidden group-hover:block">
                                {attractions.length > 0 ? (
                                    <div className="py-2 max-h-96 overflow-y-auto">
                                        {attractions.map((attraction) => (
                                            <Link
                                                key={attraction.id}
                                                href={`/portal/attraction/${attraction.id}`}
                                                className="block px-4 py-2 text-sm text-[#0F2A1D] dark:text-[#E3EED4] hover:bg-[#375534]/10 dark:hover:bg-[#375534]/30 transition flex items-start gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-semibold">{attraction.name}</div>
                                                    {attraction.location && (
                                                        <div className="text-xs text-[#6B8071] dark:text-[#AEC3B0] flex items-center gap-2 mt-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {attraction.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-4 py-6 text-center text-[#6B8071] dark:text-[#AEC3B0]">
                                        No attractions available
                                    </div>
                                )}
                            </div>
                        </div>

                        <Link href="/portal/operators" className="text-[#6B8071] dark:text-[#AEC3B0] hover:text-[#0F2A1D] dark:hover:text-white transition font-medium">
                            Operators
                        </Link>

                        <Link href="/portal/contact" className="text-[#6B8071] dark:text-[#AEC3B0] hover:text-[#0F2A1D] dark:hover:text-white transition font-medium">
                            Contact Us
                        </Link>
                    </div>
                    <a href="/login" className="px-6 py-2 bg-[#0F2A1D] hover:bg-[#375534] text-white rounded-lg transition font-semibold">
                        Register
                    </a>
                </div>
            </div>
        </nav>
    );
}
