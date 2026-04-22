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
    facebook_url?: string;
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
    const [searchTerm, setSearchTerm] = useState('');
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
        facebook_url: accommodation.facebook_url,
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

    const searchFilteredActivities = adventureCards.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const searchFilteredDestinations = filteredDestinations.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            name: 'Queny Waskin',
            role: 'Travel Blogger',
            image: 'storage/images/queny.jpg',
            text: 'Absolutely incredible experience! The platform made planning my entire trip so easy.',
            rating: 5,
        },
        {
            name: 'Kian Victorillo',
            role: 'Adventure Enthusiast',
            image: 'storage/images/kian.jpg',
            text: 'Best travel portal I\'ve used. Great deals and authentic local experiences!',
            rating: 5,
        },
        {
            name: 'Phil Gomez',
            role: 'Solo Traveler',
            image: 'storage/images/john.jpg',
            text: 'Perfect for solo trips. Easy to navigate and found amazing solo-friendly activities.',
            rating: 4,
        },
    ];

    return (
        <>
            <Head title="Tourism Management System - Discover Amazing Destinations" />

            {/* Portal Header */}
            <PortalHeader activities={activities} attractions={attractions} />

            {/* Hero Section with Search Bar */}
            <div className="relative bg-gradient-to-b from-[#375534] to-[#E3EED4] dark:from-[#375534] dark:to-[#0F2A1D] overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 w-full opacity-40"
                    style={{
                        backgroundImage: 'url("storage/images/back.jpg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                        height: 'auto',
                    }}
                />

                {/* Main Content Container */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {/* Heading */}
                    <div className="text-center mb-10 pt-8 mt-5">
                        <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg mb-4">
                            Nature, Thrills, and Memories
                        </h1>
                        <p className="text-xl text-[#E3EED4] text-white font-medium drop-shadow-md">Welcome to Badian - Your Gateway to Adventure!</p>
                    </div>

                    {/* Travel Info Card */}
                    <div className="bg-white rounded-3xl shadow-2xl mt-20 p-8 border-l-4 border-[#375534]">
                        <div className="max-w-6xl">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-[#375534] flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl md:text-3xl font-bold text-[#0F2A1D] mb-3">
                                        Badian, Cebu Travel Information
                                    </h3>
                                    <p className="text-[#6B8071] leading-relaxed text-base text-justify">
                                        Badian, located in the southwestern part of Cebu in the Philippines, is a popular eco-tourism destination known for its natural beauty, adventure activities, and relaxing coastal environment. It is best known for Kawasan Falls, famous for its vibrant turquoise waters and canyoneering experiences that attract thrill-seekers and nature lovers. Badian also serves as a gateway to nearby attractions like Moalboal, where visitors can enjoy snorkeling and the world-renowned sardine run. With its serene beaches, welcoming local culture, fresh seafood, and convenient access from Cebu City, Badian offers a well-rounded travel experience that combines adventure, relaxation, and cultural immersion while promoting sustainable tourism practices.                                    </p>
                                </div>
                            </div>
                            
                           
                        </div>
                    </div>
                </div>
            </div>

        

            {/* Featured Adventures Section */}
            <section className="bg-white dark:bg-[#0F2A1D] py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                            Featured Adventures
                        </h2>
                        <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0]">
                            Experience the best of what Badian has to offer
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {searchFilteredActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className="group flex flex-col rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 bg-white dark:bg-[#375534]/30 border-2 border-[#AEC3B0]/20 dark:border-[#375534]/40"
                            >
                                {/* Image Section with Badge */}
                                <div className="relative w-full h-56 overflow-hidden bg-gray-200 flex-shrink-0">
                                    <img
                                        src={activity.image}
                                        alt={activity.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute top-3 left-3 bg-[#375534] text-white px-3 py-1 rounded-full text-xs font-bold">
                                        Featured
                                    </div>
                                    {activity.rating && activity.rating >= 4.5 && (
                                        <div className="absolute top-3 right-3 bg-yellow-400 text-[#0F2A1D] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" /> Top Rated
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div className="p-6">
                                    <h4 className="text-xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        {activity.name}
                                    </h4>
                                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] line-clamp-2">
                                        {activity.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Category Filter & Attractions Section */}
            <section className="bg-gradient-to-r from-[#E3EED4] to-white dark:from-[#0F2A1D] dark:to-[#375534]/20 py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                            Explore Attractions
                        </h2>
                        <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0]">
                            Discover amazing tourist destinations and natural wonders
                        </p>
                    </div>

                    {/* Category Filters */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
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
                    </div>

                    {/* Attractions Grid - Changed from horizontal to card layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {searchFilteredDestinations.map((dest) => (
                            <div
                                key={dest.id}
                                className="group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 bg-white dark:bg-[#375534]/30 border-2 border-[#AEC3B0]/20 dark:border-[#375534]/40"
                            >
                                {/* Image Section */}
                                <div className="relative w-full h-64 overflow-hidden bg-gray-200">
                                    <img
                                        src={dest.image}
                                        alt={dest.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute top-3 left-3 bg-[#375534] text-white px-3 py-1 rounded-full text-xs font-bold">
                                        Attraction
                                    </div>
                                    {dest.rating && dest.rating >= 4.5 && (
                                        <div className="absolute top-3 right-3 bg-yellow-400 text-[#0F2A1D] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" /> Top Rated
                                        </div>
                                    )}
                                    <button
                                        onClick={() => toggleLike(dest.id)}
                                        className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${
                                            likedDestinations.includes(dest.id)
                                                ? 'bg-red-500 text-white'
                                                : 'bg-white/80 text-[#0F2A1D] hover:bg-white'
                                        }`}
                                    >
                                        <Heart className={`w-5 h-5 ${likedDestinations.includes(dest.id) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>

                                {/* Content Section */}
                                <div className="p-6">
                                    <h4 className="text-xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        {dest.name}
                                    </h4>
                                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-4 line-clamp-2">
                                        {dest.description}
                                    </p>
                                    <p className="text-xs text-[#AEC3B0] dark:text-[#6B8071] flex items-center gap-2 mb-4">
                                        <MapPin className="w-4 h-4 text-[#375534] dark:text-[#AEC3B0]" />
                                        {dest.dateRange}
                                    </p>

                                    {/* Rating */}
                                    {dest.rating && (
                                        <div className="flex items-center gap-2 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${
                                                        i < Math.floor(dest.rating!)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300 dark:text-gray-600'
                                                    }`}
                                                />
                                            ))}
                                            <span className="text-xs font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">{dest.rating}/5</span>
                                        </div>
                                    )}

                                    {/* Entry Fee */}
                                    {dest.price && dest.price > 0 && (
                                        <div className="text-sm font-bold text-[#375534] dark:text-[#E3EED4] mb-4">
                                            Entry Fee: ₱{parseFloat(dest.price.toString()).toFixed(2)}
                                        </div>
                                    )}

                                    <button className="w-full px-4 py-2 bg-gradient-to-r from-[#375534] to-[#0F2A1D] text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 dark:from-[#AEC3B0] dark:to-[#375534] dark:text-[#0F2A1D]">
                                        Learn More
                                        <ArrowRight className="w-4 h-4" />
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
                            Where to Stay
                        </h2>
                        <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0]">
                            Discover the perfect place to stay in Badian with options for every traveler and budget
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {accommodationCards.map((accommodation) => (
                            <div
                                key={accommodation.id}
                                className="group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 bg-white dark:bg-[#375534]/30 border-2 border-[#AEC3B0]/20 dark:border-[#375534]/40"
                            >
                                <div className="relative h-72 overflow-hidden bg-gray-200">
                                    <img
                                        src={accommodation.image}
                                        alt={accommodation.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
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
                                    <div className="absolute top-4 right-4 bg-[#375534] text-white px-3 py-1 rounded-full text-xs font-bold">
                                        Accommodation
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h4 className="text-lg font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        {accommodation.name}
                                    </h4>
                                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-4 leading-relaxed line-clamp-2">
                                        {accommodation.description}
                                    </p>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${
                                                        i < Math.floor(accommodation.rating)
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                            {accommodation.rating > 0 ? accommodation.rating : 'New'}
                                        </span>
                                    </div>
                                    <a href={accommodation.facebook_url || '#'} target="_blank" rel="noopener noreferrer" className="w-full py-2 bg-gradient-to-r from-[#375534] to-[#0F2A1D] text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 dark:from-[#AEC3B0] dark:to-[#375534] dark:text-[#0F2A1D] text-sm">
                                        Book Now
                                        <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="bg-gradient-to-r from-[#E3EED4] to-white dark:from-[#0F2A1D] dark:to-[#375534]/20 py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                            What Travelers Say
                        </h2>
                        <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0]">
                            Hear from visitors who've experienced the magic of Badian
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-[#375534]/30 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-[#AEC3B0]/20 dark:border-[#375534]/40"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-[#375534]"
                                    />
                                    <div>
                                        <h4 className="font-bold text-[#0F2A1D] dark:text-[#E3EED4]">{testimonial.name}</h4>
                                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">{testimonial.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-[#6B8071] dark:text-[#AEC3B0] italic leading-relaxed">
                                    "{testimonial.text}"
                                </p>
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
                        Create an account and get exclusive access to special deals, personalized recommendations, and early booking discounts
                    </p>
                    <button className="px-10 py-4 bg-white text-[#0F2A1D] font-bold rounded-xl hover:bg-[#E3EED4] transition-all flex items-center gap-3 mx-auto text-lg shadow-lg hover:shadow-2xl">
                        Get Started Now
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </section>

            {/* About Badian Section - Enhanced */}
            <section className="bg-white dark:bg-[#0F2A1D] py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left - Image */}
                        <div className="rounded-3xl overflow-hidden shadow-2xl order-last lg:order-first">
                            <img
                                src="storage/images/canyoneering.jpg"
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
