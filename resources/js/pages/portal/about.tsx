import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import PortalHeader from '@/components/portal-header';
import { MapPin, Users, Globe, Award, Leaf, Heart, Clock, Star, Compass } from 'lucide-react';

interface Attraction {
    id: number;
    name: string;
    location?: string;
    description?: string;
    best_time_to_visit?: string;
    entry_fee?: number | null;
    image_url?: string | null;
    rating?: number | null;
}

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
}

interface AboutProps {
    attractions: Attraction[];
    activities: Activity[];
}

export default function About({ attractions = [], activities = [] }: AboutProps) {
    return (
        <>
            <Head title="About Us" />
            <PortalHeader />

            <main className="min-h-screen">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-[#E3EED4] via-[#AEC3B0] to-[#6B8071] dark:from-[#0F2A1D] dark:via-[#1F3A2F] dark:to-[#375534] py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-5xl sm:text-6xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-6">
                                About Badian
                            </h1>
                            <p className="text-xl text-[#6B8071] dark:text-[#AEC3B0] max-w-3xl mx-auto">
                                Your Gateway to Discovering the Hidden Gems of Badian, Cebu
                            </p>
                        </div>
                    </div>
                </section>

                {/* Sidebar Layout - About, Mission/Vision/Values, Attractions, Activities */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 py-16">
                        {/* Left Sidebar - Sticky About Card */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 bg-gradient-to-br from-[#6B8071] to-[#375534] dark:from-[#375534] dark:to-[#0F2A1D] rounded-lg shadow-2xl p-8 border-2 border-[#AEC3B0] dark:border-[#AEC3B0]">
                                <h2 className="text-3xl font-bold text-white dark:text-[#E3EED4] mb-8">
                                    About Badian
                                </h2>
                                
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <MapPin className="w-5 h-5 text-[#AEC3B0]" />
                                            <h3 className="text-lg font-semibold text-[#E3EED4]">Location</h3>
                                        </div>
                                        <p className="text-[#AEC3B0] text-sm ml-8">
                                            Southern Municipality of Cebu, Philippines
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Users className="w-5 h-5 text-[#AEC3B0]" />
                                            <h3 className="text-lg font-semibold text-[#E3EED4]">Population</h3>
                                        </div>
                                        <p className="text-[#AEC3B0] text-sm ml-8">
                                            Approximately 15,000+ residents
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Globe className="w-5 h-5 text-[#AEC3B0]" />
                                            <h3 className="text-lg font-semibold text-[#E3EED4]">Area</h3>
                                        </div>
                                        <p className="text-[#AEC3B0] text-sm ml-8">
                                            Approximately 94.19 square kilometers
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Award className="w-5 h-5 text-[#AEC3B0]" />
                                            <h3 className="text-lg font-semibold text-[#E3EED4]">Known For</h3>
                                        </div>
                                        <p className="text-[#AEC3B0] text-sm ml-8">
                                            Pristine beaches, marine biodiversity, and cultural heritage
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Star className="w-5 h-5 text-[#AEC3B0]" />
                                            <h3 className="text-lg font-semibold text-[#E3EED4]">Best Season</h3>
                                        </div>
                                        <p className="text-[#AEC3B0] text-sm ml-8">
                                            November to May (Dry Season)
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-[#AEC3B0]/30">
                                    <p className="text-[#AEC3B0] text-sm italic">
                                        "Discover paradise in the heart of Cebu. Experience authentic Filipino hospitality and natural beauty."
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Content Area - 2 Columns */}
                        <div className="lg:col-span-2 space-y-16">
                            {/* Mission, Vision, Values */}
                            <div>
                                <h2 className="text-3xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-6">
                                    Our Foundation
                                </h2>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#1F3A2F] dark:to-[#375534] rounded-lg shadow-lg p-8 border-2 border-[#AEC3B0] dark:border-[#6B8071]">
                                        <div className="w-12 h-12 rounded-lg bg-[#0F2A1D] dark:bg-white flex items-center justify-center mb-4">
                                            <Globe className="w-6 h-6 text-[#E3EED4] dark:text-[#0F2A1D]" />
                                        </div>
                                        <h3 className="text-xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-3">
                                            Our Mission
                                        </h3>
                                        <p className="text-[#6B8071] dark:text-[#AEC3B0] leading-relaxed">
                                            To promote sustainable tourism in Badian by connecting travelers with authentic experiences, local attractions, and community-driven activities that preserve our natural and cultural heritage.
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#AEC3B0] to-[#6B8071] dark:from-[#375534] dark:to-[#6B8071] rounded-lg shadow-lg p-8 border-2 border-[#6B8071] dark:border-[#AEC3B0]">
                                        <div className="w-12 h-12 rounded-lg bg-white dark:bg-[#0F2A1D] flex items-center justify-center mb-4">
                                            <Heart className="w-6 h-6 text-[#0F2A1D] dark:text-[#E3EED4]" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white dark:text-[#E3EED4] mb-3">
                                            Our Vision
                                        </h3>
                                        <p className="text-white dark:text-[#AEC3B0] leading-relaxed">
                                            To become the leading tourism platform that empowers local communities, protects our environment, and provides memorable experiences for every visitor to Badian.
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#6B8071] to-[#375534] dark:from-[#6B8071] dark:to-[#0F2A1D] rounded-lg shadow-lg p-8 border-2 border-[#375534] dark:border-[#E3EED4]">
                                        <div className="w-12 h-12 rounded-lg bg-[#E3EED4] dark:bg-[#E3EED4] flex items-center justify-center mb-4">
                                            <Leaf className="w-6 h-6 text-[#0F2A1D]" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white dark:text-[#E3EED4] mb-3">
                                            Our Values
                                        </h3>
                                        <p className="text-white dark:text-[#AEC3B0] leading-relaxed">
                                            Sustainability, Community, Authenticity, and Excellence. We believe in responsible tourism that benefits both visitors and local communities.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Attractions */}
                            <div className="bg-gradient-to-br from-[#F5F9F7] to-[#E3EED4] dark:from-[#1F3A2F] dark:to-[#0F2A1D] rounded-lg p-8 border-2 border-[#AEC3B0] dark:border-[#375534]">
                                <h2 className="text-3xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-6">
                                    Featured Attractions
                                </h2>
                                <p className="text-[#6B8071] dark:text-[#AEC3B0] mb-8">
                                    Explore the most beautiful and iconic attractions in Badian
                                </p>
                                <div className="grid grid-cols-1 gap-6">
                                    {attractions.length > 0 ? (
                                        attractions.map((attraction) => (
                                            <Link
                                                key={attraction.id}
                                                href={`/portal/attraction/${attraction.id}`}
                                                className="group"
                                            >
                                                <div className="bg-white dark:bg-[#0F2A1D] rounded-lg overflow-hidden shadow-lg border-2 border-[#AEC3B0] dark:border-[#375534] hover:shadow-xl hover:border-[#6B8071] dark:hover:border-[#AEC3B0] transition-all duration-300 flex gap-4">
                                                    {attraction.image_url && (
                                                        <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-[#AEC3B0] to-[#6B8071] dark:from-[#375534] dark:to-[#6B8071] overflow-hidden rounded-l-lg">
                                                            <img
                                                                src={attraction.image_url}
                                                                alt={attraction.name}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 p-4">
                                                        <h3 className="text-lg font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-2 group-hover:text-[#375534] dark:group-hover:text-[#AEC3B0] transition">
                                                            {attraction.name}
                                                        </h3>
                                                        {attraction.location && (
                                                            <div className="flex items-center gap-2 text-[#6B8071] dark:text-[#AEC3B0] mb-2">
                                                                <MapPin className="w-3 h-3" />
                                                                <span className="text-xs">{attraction.location}</span>
                                                            </div>
                                                        )}
                                                        <p className="text-[#6B8071] dark:text-[#AEC3B0] text-xs line-clamp-1 mb-3">
                                                            {attraction.description}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            {attraction.rating && (
                                                                <div className="flex items-center gap-1">
                                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                                    <span className="text-xs font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                                                        {attraction.rating}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {attraction.entry_fee && (
                                                                <span className="text-xs font-semibold text-[#375534] dark:text-[#AEC3B0]">
                                                                    ₱{attraction.entry_fee}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-[#6B8071] dark:text-[#AEC3B0]">
                                            <p>No attractions available at the moment.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Exciting Activities */}
                            <div className="bg-white dark:bg-[#0F2A1D] rounded-lg p-8 border-2 border-[#AEC3B0] dark:border-[#375534]">
                                <h2 className="text-3xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-6">
                                    Exciting Activities
                                </h2>
                                <p className="text-[#6B8071] dark:text-[#AEC3B0] mb-8">
                                    Participate in unforgettable experiences led by local experts
                                </p>
                                <div className="grid grid-cols-1 gap-6">
                                    {activities.length > 0 ? (
                                        activities.map((activity) => (
                                            <Link
                                                key={activity.id}
                                                href={`/portal/activity/${activity.id}`}
                                                className="group"
                                            >
                                                <div className="bg-gradient-to-br from-[#F5F9F7] to-[#E3EED4] dark:from-[#1F3A2F] dark:to-[#0F2A1D] rounded-lg overflow-hidden shadow-lg border-2 border-[#AEC3B0] dark:border-[#375534] hover:shadow-xl hover:border-[#6B8071] dark:hover:border-[#AEC3B0] transition-all duration-300 flex gap-4">
                                                    {activity.image_url && (
                                                        <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-[#AEC3B0] to-[#6B8071] dark:from-[#375534] dark:to-[#6B8071] overflow-hidden rounded-l-lg">
                                                            <img
                                                                src={activity.image_url}
                                                                alt={activity.name}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 p-4">
                                                        <h3 className="text-lg font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-2 group-hover:text-[#375534] dark:group-hover:text-[#AEC3B0] transition">
                                                            {activity.name}
                                                        </h3>
                                                        <div className="space-y-1 mb-3">
                                                            <div className="flex items-center gap-2 text-[#6B8071] dark:text-[#AEC3B0]">
                                                                <Clock className="w-3 h-3" />
                                                                <span className="text-xs">{activity.duration}</span>
                                                            </div>
                                                            {activity.difficulty_level && (
                                                                <div className="flex items-center gap-2 text-[#6B8071] dark:text-[#AEC3B0]">
                                                                    <Compass className="w-3 h-3" />
                                                                    <span className="text-xs capitalize">{activity.difficulty_level}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            {activity.rating && (
                                                                <div className="flex items-center gap-1">
                                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                                    <span className="text-xs font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                                                        {activity.rating}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {activity.price && (
                                                                <span className="text-xs font-semibold text-[#375534] dark:text-[#AEC3B0]">
                                                                    ₱{activity.price}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-[#6B8071] dark:text-[#AEC3B0]">
                                            <p>No activities available at the moment.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Discover Badian Facts */}
                            <div className="bg-gradient-to-br from-[#6B8071] via-[#375534] to-[#0F2A1D] dark:from-[#6B8071] dark:via-[#375534] dark:to-[#0F2A1D] rounded-lg p-8 border-2 border-[#AEC3B0]">
                                <h2 className="text-3xl font-bold text-[#E3EED4] mb-4">
                                    Discover Badian
                                </h2>
                                <p className="text-[#AEC3B0] mb-8">
                                    Interesting facts and details about our beautiful destination
                                </p>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-[#AEC3B0]/30">
                                        <h3 className="text-xl font-bold text-[#E3EED4] mb-3">
                                            Location & Geography
                                        </h3>
                                        <ul className="space-y-2 text-[#AEC3B0] text-sm">
                                            <li className="flex gap-3">
                                                <span className="text-[#E3EED4] font-bold">•</span>
                                                <span>Located in the southern municipality of Cebu, Philippines</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="text-[#E3EED4] font-bold">•</span>
                                                <span>Known for its pristine beaches and crystal-clear waters</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-[#AEC3B0]/30">
                                        <h3 className="text-xl font-bold text-[#E3EED4] mb-3">
                                            Culture & Community
                                        </h3>
                                        <ul className="space-y-2 text-[#AEC3B0] text-sm">
                                            <li className="flex gap-3">
                                                <span className="text-[#E3EED4] font-bold">•</span>
                                                <span>Rich cultural heritage with vibrant local traditions</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="text-[#E3EED4] font-bold">•</span>
                                                <span>Warm and hospitable local community</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-[#AEC3B0]/30">
                                        <h3 className="text-xl font-bold text-[#E3EED4] mb-3">
                                            Best Time to Visit
                                        </h3>
                                        <ul className="space-y-2 text-[#AEC3B0] text-sm">
                                            <li className="flex gap-3">
                                                <span className="text-[#E3EED4] font-bold">•</span>
                                                <span>Dry season: November to May (peak tourist season)</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="text-[#E3EED4] font-bold">•</span>
                                                <span>Whale shark season: October to June</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-[#AEC3B0]/30">
                                        <h3 className="text-xl font-bold text-[#E3EED4] mb-3">
                                            Sustainability & Conservation
                                        </h3>
                                        <ul className="space-y-2 text-[#AEC3B0] text-sm">
                                            <li className="flex gap-3">
                                                <span className="text-[#E3EED4] font-bold">•</span>
                                                <span>Protected marine areas for coral and fish conservation</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="text-[#E3EED4] font-bold">•</span>
                                                <span>Community-based eco-tourism initiatives</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <section className="bg-gradient-to-br from-[#E3EED4] via-[#AEC3B0] to-[#6B8071] dark:from-[#0F2A1D] dark:via-[#1F3A2F] dark:to-[#375534] py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-4xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-6">
                            Ready to Explore Badian?
                        </h2>
                        <p className="text-xl text-[#6B8071] dark:text-[#AEC3B0] mb-8">
                            Start your journey with us and discover the magic of Badian.
                        </p>
                        <a
                            href="/portal"
                            className="inline-block px-8 py-4 bg-gradient-to-r from-[#0F2A1D] to-[#375534] hover:from-[#375534] hover:to-[#6B8071] text-white font-semibold rounded-lg transition duration-200 shadow-lg"
                        >
                            Explore Now
                        </a>
                    </div>
                </section>
            </main>
        </>
    );
}
