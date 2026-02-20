import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { MapPin, Heart, Star, Users, Calendar, ArrowRight, Search, ChevronLeft, ChevronRight, Zap, Shield, Globe, Clock, TrendingUp } from 'lucide-react';
import { Link } from '@inertiajs/react';
import PortalHeader from '@/components/portal-header';

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
}

interface Accommodation {
    id: number;
    name: string;
    description: string;
    type: string;
    location: string;
    image_url: string | null;
    rating: number | null;
    status: string;
}

interface PortalHomeProps {
    attractions: Attraction[];
    activities: Activity[];
    accommodations: Accommodation[];
}

export default function PortalHome({ attractions = [], activities = [], accommodations = [] }: PortalHomeProps) {
    const [likedDestinations, setLikedDestinations] = useState<number[]>([]);
    const [likedActivities, setLikedActivities] = useState<number[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchData, setSearchData] = useState({
        origin: '',
        destination: '',
        date: '',
        guests: '',
    });

    const toggleLike = (id: number) => {
        setLikedDestinations(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const toggleActivityLike = (id: number) => {
        setLikedActivities(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    // Map attractions to destinations format
    const destinations = attractions.map(attr => ({
        id: attr.id,
        name: attr.name,
        image: attr.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        price: attr.entry_fee || 0,
        dateRange: attr.location,
        category: attr.category.toLowerCase(),
        description: attr.description,
        rating: attr.rating,
    }));

    // Map activities to Adventure cards format
    const adventureCards = activities.map(activity => ({
        id: activity.id,
        name: activity.name,
        image: activity.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        description: activity.description,
        duration: activity.duration,
        difficulty: activity.difficulty_level,
        maxParticipants: activity.max_participants,
        price: activity.price || 0,
        rating: activity.rating,
    }));

    // Map accommodations to display format
    const accommodationCards = accommodations.map(accommodation => ({
        id: accommodation.id,
        name: accommodation.name,
        image: accommodation.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        description: accommodation.description,
        rating: accommodation.rating || 0,
        reviews: 0,
        pricePerNight: 0,
    }));

    const categories = [
        { id: 'all', label: 'All', icon: '🌍' },
        { id: 'adventure', label: 'Adventure', icon: '🎯' },
        { id: 'beach', label: 'Beach', icon: '🏝️' },
        { id: 'nature', label: 'Nature', icon: '🌲' },
        { id: 'water sports', label: 'Water Sports', icon: '🏄' },
        { id: 'cultural', label: 'Cultural', icon: '🎭' },
        { id: 'scenic', label: 'Scenic', icon: '🏔️' },
    ];

    const filteredDestinations = selectedCategory === 'all' 
        ? destinations 
        : destinations.filter(d => d.category === selectedCategory);

    const features = [
        {
            icon: <Zap className="w-8 h-8" />,
            title: 'Instant Booking',
            description: 'Book your perfect trip in seconds with our streamlined system',
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: 'Secure Platform',
            description: 'Your data and payments are protected with enterprise-grade security',
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: 'Global Coverage',
            description: 'Explore thousands of destinations worldwide at your fingertips',
        },
    ];

    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Travel Blogger',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
            text: 'Absolutely incredible experience! The platform made planning my entire trip so easy.',
            rating: 5,
        },
        {
            name: 'Michael Chen',
            role: 'Adventure Enthusiast',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            text: 'Best travel portal I\'ve used. Great deals and authentic local experiences!',
            rating: 5,
        },
        {
            name: 'Emma Williams',
            role: 'Family Traveler',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
            text: 'Perfect for family trips. Easy to navigate and found amazing family-friendly activities.',
            rating: 4,
        },
    ];

    return (
        <>
            <Head title="Tourism Management System - Discover Amazing Destinations" />

            {/* Portal Header */}
            <PortalHeader activities={activities} attractions={attractions} />

            {/* Hero & Main Content Section - All in One */}
            <div className="relative bg-gradient-to-b from-[#375534] to-[#E3EED4] dark:from-[#375534] dark:to-[#0F2A1D] overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 w-full opacity-40"
                    style={{
                        backgroundImage: 'url("/images/background.jpg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                        height: '400px',
                    }}
                />

                {/* Main Content Container */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Heading */}
                    <div className="text-center mb-8 pt-8">
                        <h2 className="text-6xl md:text-7xl font-bold text-white drop-shadow-lg">
                            Nature, Thrills, and Memories – Welcome to Badian!
                        </h2>
                    </div>

                    {/* Badian Travel Information */}
                    <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12">
                        <div className="max-w-4xl">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-[#375534] flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl md:text-3xl font-bold text-[#0F2A1D] mb-3">
                                        Badian, Cebu Travel Information
                                    </h3>
                                    <p className="text-[#6B8071] leading-relaxed text-base">
                                        Welcome to the Municipality of Badian, we would like to offer tourists and backpackers a starting point for exploring the town and surrounding sights. Let us introduce you to some of the tourist resorts and accommodation available here in Badian.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Badian Tourist Adventures */}
                    <div className="mb-12">
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-8 drop-shadow-lg text-center">Badian Tourist Adventures</h3>
                        {/* Activities Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
                            {adventureCards.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="group flex flex-col rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer bg-white dark:bg-[#375534]/30"
                                >
                                    {/* Image Section */}
                                    <div className="relative w-full h-48 overflow-hidden bg-gray-200 flex-shrink-0">
                                        <img
                                            src={activity.image}
                                            alt={activity.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex flex-col justify-between p-6 w-full">
                                        <div>
                                            <h4 className="text-lg font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                                {activity.name}
                                            </h4>
                                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-4 line-clamp-3">
                                                {activity.description}
                                            </p>

                                            {/* Activity Details */}
                                            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                                                <div className="flex items-center gap-2 text-[#6B8071] dark:text-[#AEC3B0]">
                                                    <Clock className="w-4 h-4 text-[#375534] dark:text-[#AEC3B0]" />
                                                    <span>{activity.duration}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[#6B8071] dark:text-[#AEC3B0]">
                                                    <TrendingUp className="w-4 h-4 text-[#375534] dark:text-[#AEC3B0]" />
                                                    <span className="capitalize">{activity.difficulty}</span>
                                                </div>
                                                {activity.maxParticipants && (
                                                    <div className="flex items-center gap-2 text-[#6B8071] dark:text-[#AEC3B0]">
                                                        <Users className="w-4 h-4 text-[#375534] dark:text-[#AEC3B0]" />
                                                        <span>Max {activity.maxParticipants}</span>
                                                    </div>
                                                )}
                                                {activity.price > 0 && (
                                                    <div className="flex items-center gap-2 text-[#6B8071] dark:text-[#AEC3B0]">
                                                        <Zap className="w-4 h-4 text-[#375534] dark:text-[#AEC3B0]" />
                                                        <span>₱{parseFloat(activity.price.toString()).toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Rating */}
                                            {activity.rating && (
                                                <div className="flex items-center gap-2 mb-4">
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
                                                    <span className="text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4]">{activity.rating}/5</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Like Button */}
                                        <button
                                            onClick={() => toggleActivityLike(activity.id)}
                                            className={`self-start mt-3 p-2.5 rounded-full transition-all ${
                                                likedActivities.includes(activity.id)
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-[#375534]/20 text-[#375534] dark:bg-[#AEC3B0]/20 dark:text-[#AEC3B0] hover:bg-[#375534]/30'
                                            }`}
                                            title="Like this activity"
                                        >
                                            <Heart className={`w-5 h-5 ${likedActivities.includes(activity.id) ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Filter Section */}
            <section className="bg-gradient-to-r from-[#E3EED4] to-white dark:from-[#0F2A1D] dark:to-[#375534]/20 py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                            Badian Tourist Attractions
                        </h2>
                        <p className="text-[#6B8071] dark:text-[#AEC3B0]">
                            Discover amazing tourist destinations and top-rated accommodations
                        </p>
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto pb-4">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                                    selectedCategory === cat.id
                                        ? 'bg-[#375534] text-white shadow-lg transform scale-105'
                                        : 'bg-white dark:bg-[#375534]/30 text-[#0F2A1D] dark:text-[#E3EED4] border-2 border-[#AEC3B0]/40 dark:border-[#375534]/40 hover:border-[#375534]'
                                }`}
                            >
                                <span>{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        {filteredDestinations.map((dest) => (
                            <div
                                key={dest.id}
                                className="group flex rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer bg-white dark:bg-[#375534]/30"
                            >
                                {/* Image Section */}
                                <div className="relative w-2/5 h-64 overflow-hidden bg-gray-200 flex-shrink-0">
                                    <img
                                        src={dest.image}
                                        alt={dest.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>

                                {/* Content Section */}
                                <div className="flex flex-col justify-between p-6 w-3/5">
                                    <div>
                                        <h4 className="text-lg font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                            {dest.name}
                                        </h4>
                                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-3 line-clamp-3">
                                            {dest.description}
                                        </p>
                                        <p className="text-xs text-[#AEC3B0] dark:text-[#6B8071] flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-[#375534] dark:text-[#AEC3B0]" />
                                            {dest.dateRange}
                                        </p>
                                    </div>

                                    {/* Like Button */}
                                    <button
                                        onClick={() => toggleLike(dest.id)}
                                        className={`self-start mt-3 p-2.5 rounded-full transition-all ${
                                            likedDestinations.includes(dest.id)
                                                ? 'bg-red-500 text-white'
                                                : 'bg-[#375534]/20 text-[#375534] dark:bg-[#AEC3B0]/20 dark:text-[#AEC3B0] hover:bg-[#375534]/30'
                                        }`}
                                        title="Like this attraction"
                                    >
                                        <Heart className={`w-5 h-5 ${likedDestinations.includes(dest.id) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* Badian Tourist Accommodation Section */}
            <section className="bg-white dark:bg-[#0F2A1D] py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                            Badian Tourist Accommodation
                        </h2>
                        <p className="text-[#6B8071] dark:text-[#AEC3B0] text-lg">
                            Discover the perfect place to stay in Badian with a variety of options for every traveler
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {accommodationCards.map((accommodation) => (
                            <div
                                key={accommodation.id}
                                className="group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer bg-white dark:bg-[#375534]/30 border-2 border-[#AEC3B0]/20 dark:border-[#375534]/40"
                            >
                                <div className="relative h-72 overflow-hidden bg-gray-200">
                                    <img
                                        src={accommodation.image}
                                        alt={accommodation.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    {/* Price Tag */}
                                    {accommodation.pricePerNight > 0 && (
                                        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#375534] to-[#0F2A1D] px-4 py-2 rounded-full font-bold text-white shadow-lg">
                                            ${accommodation.pricePerNight}
                                            <span className="text-xs">/night</span>
                                        </div>
                                    )}
                                    {/* Like Button */}
                                    <button
                                        onClick={() => toggleLike(100 + accommodation.id)}
                                        className={`absolute top-4 left-4 p-3 rounded-full transition-all ${
                                            likedDestinations.includes(100 + accommodation.id)
                                                ? 'bg-red-500 text-white'
                                                : 'bg-white/80 text-[#0F2A1D] hover:bg-white'
                                        }`}
                                    >
                                        <Heart className={`w-6 h-6 ${likedDestinations.includes(100 + accommodation.id) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <h4 className="text-xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        {accommodation.name}
                                    </h4>
                                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-4 leading-relaxed">
                                        {accommodation.description}
                                    </p>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                        i < Math.floor(accommodation.rating)
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                            {accommodation.rating > 0 ? accommodation.rating : 'New'}
                                        </span>
                                        {accommodation.reviews > 0 && (
                                            <span className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">
                                                ({accommodation.reviews} reviews)
                                            </span>
                                        )}
                                    </div>
                                    <button className="w-full py-3 bg-gradient-to-r from-[#375534] to-[#0F2A1D] text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 dark:from-[#AEC3B0] dark:to-[#375534] dark:text-[#0F2A1D]">
                                        Book Now
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

             {/* CTA Section */}
            <section className="bg-gradient-to-r from-[#0F2A1D] to-[#375534] py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Start Your Adventure?
                    </h2>
                    <p className="text-[#E3EED4] text-lg mb-10">
                        Create an account and get exclusive access to deals and personalized recommendations
                    </p>
                    <button className="px-10 py-4 bg-white text-[#0F2A1D] font-bold rounded-xl hover:bg-[#E3EED4] transition-all flex items-center gap-3 mx-auto text-lg shadow-lg hover:shadow-2xl">
                        Get Started Now
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </section>

            {/* About Badian Section */}
            <section className="bg-gradient-to-br from-[#E3EED4] to-white dark:from-[#0F2A1D] dark:to-[#375534]/20 py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left - Image */}
                        <div className="rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=500&fit=crop"
                                alt="Badian Cebu"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Right - Content */}
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-6">
                                About Badian
                            </h2>
                            <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0] mb-6 leading-relaxed">
                                Nestled on the southwestern coast of Cebu, Philippines, Badian is a hidden gem for adventure seekers and nature lovers. This picturesque municipality offers a perfect blend of thrilling water activities, stunning natural landscapes, and warm hospitality.
                            </p>
                            <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0] mb-8 leading-relaxed">
                                From world-class canyoneering experiences to pristine beaches and lush mountain trails, Badian promises unforgettable memories. Our tourism portal is dedicated to helping you discover the best that Badian has to offer, with curated accommodations, authentic adventures, and insider tips.
                            </p>

                            {/* Key Features */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-xl bg-white dark:bg-[#375534]/30 border-2 border-[#AEC3B0]/40 dark:border-[#375534]/40">
                                    <div className="text-2xl font-bold text-[#375534] dark:text-[#E3EED4] mb-2">50+</div>
                                    <div className="text-sm font-semibold text-[#0F2A1D] dark:text-[#AEC3B0]">Adventure Activities</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white dark:bg-[#375534]/30 border-2 border-[#AEC3B0]/40 dark:border-[#375534]/40">
                                    <div className="text-2xl font-bold text-[#375534] dark:text-[#E3EED4] mb-2">30+</div>
                                    <div className="text-sm font-semibold text-[#0F2A1D] dark:text-[#AEC3B0]">Accommodations</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white dark:bg-[#375534]/30 border-2 border-[#AEC3B0]/40 dark:border-[#375534]/40">
                                    <div className="text-2xl font-bold text-[#375534] dark:text-[#E3EED4] mb-2">10+</div>
                                    <div className="text-sm font-semibold text-[#0F2A1D] dark:text-[#AEC3B0]">Scenic Spots</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white dark:bg-[#375534]/30 border-2 border-[#AEC3B0]/40 dark:border-[#375534]/40">
                                    <div className="text-2xl font-bold text-[#375534] dark:text-[#E3EED4] mb-2">24/7</div>
                                    <div className="text-sm font-semibold text-[#0F2A1D] dark:text-[#AEC3B0]">Support</div>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <button className="px-8 py-4 bg-gradient-to-r from-[#375534] to-[#0F2A1D] text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-3 dark:from-[#AEC3B0] dark:to-[#375534] dark:text-[#0F2A1D]">
                                Explore More About Badian
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#0F2A1D] text-[#E3EED4] py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h5 className="font-bold text-lg mb-4">About Badian</h5>
                            <p className="text-sm text-[#AEC3B0]">
                                Discover the beauty of Badian, Cebu. Your gateway to unforgettable island experiences, thrilling adventures, and authentic local culture in Badian.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-bold text-lg mb-4">Quick Links</h5>
                            <ul className="space-y-2 text-sm text-[#AEC3B0]">
                                <li><a href="#" className="hover:text-white transition">About Badian</a></li>
                                <li><a href="#" className="hover:text-white transition">Activities & Adventures</a></li>
                                <li><a href="#" className="hover:text-white transition">Accommodations</a></li>
                                <li><a href="#" className="hover:text-white transition">Travel Tips</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold text-lg mb-4">Legal</h5>
                            <ul className="space-y-2 text-sm text-[#AEC3B0]">
                                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white transition">Booking Terms</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold text-lg mb-4">Contact</h5>
                            <p className="text-sm text-[#AEC3B0]">
                                <strong>Email:</strong> info@badian.com<br />
                                <strong>Phone:</strong> +63 (32) 474-2000<br />
                                <strong>Location:</strong> Badian, Cebu, Philippines
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-[#375534] pt-8 text-center text-sm text-[#AEC3B0]">
                        <p>&copy; 2026 Badian Tourism Management. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
