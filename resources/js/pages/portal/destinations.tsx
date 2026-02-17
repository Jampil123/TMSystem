import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { MapPin, Heart, Star, Filter, X, ChevronDown } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function PortalDestinations() {
    const [likedDestinations, setLikedDestinations] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(true);
    const [filters, setFilters] = useState({
        priceRange: [0, 500],
        rating: 0,
        category: 'all',
    });

    const toggleLike = (id: number) => {
        setLikedDestinations(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const destinations = [
        {
            id: 1,
            name: 'Mountain Peak Resort',
            category: 'Resort',
            location: 'Alpine Region',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
            rating: 4.8,
            reviews: 324,
            price: 120,
            description: 'Experience breathtaking mountain views with world-class amenities',
        },
        {
            id: 2,
            name: 'Coastal Escape',
            category: 'Beach',
            location: 'Seaside',
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=300&fit=crop',
            rating: 4.7,
            reviews: 287,
            price: 95,
            description: 'Pristine beaches and crystal clear waters',
        },
        {
            id: 3,
            name: 'Urban Explorer',
            category: 'City',
            location: 'Downtown',
            image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=500&h=300&fit=crop',
            rating: 4.6,
            reviews: 412,
            price: 85,
            description: 'Vibrant city culture and world-renowned cuisine',
        },
        {
            id: 4,
            name: 'Jungle Retreat',
            category: 'Nature',
            location: 'Rainforest',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
            rating: 4.9,
            reviews: 198,
            price: 110,
            description: 'Immerse yourself in exotic wildlife and nature',
        },
        {
            id: 5,
            name: 'Desert Oasis',
            category: 'Resort',
            location: 'Desert',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop',
            rating: 4.5,
            reviews: 156,
            price: 100,
            description: 'Luxury meets adventure in the heart of the desert',
        },
        {
            id: 6,
            name: 'Historic Manor',
            category: 'Cultural',
            location: 'Heritage Zone',
            image: 'https://images.unsplash.com/photo-1488913529944-40fc96b63f44?w=500&h=300&fit=crop',
            rating: 4.7,
            reviews: 234,
            price: 130,
            description: 'Step back in time in our beautifully preserved historic property',
        },
    ];

    const filteredDestinations = destinations.filter(dest => {
        const priceMatch = dest.price >= filters.priceRange[0] && dest.price <= filters.priceRange[1];
        const ratingMatch = filters.rating === 0 || dest.rating >= filters.rating;
        const categoryMatch = filters.category === 'all' || dest.category === filters.category;
        return priceMatch && ratingMatch && categoryMatch;
    });

    return (
        <>
            <Head title="Destinations - Tourism Management System" />

            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white dark:bg-[#0F2A1D] shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/portal" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#375534] to-[#0F2A1D] flex items-center justify-center">
                                <span className="text-white font-bold text-lg">TM</span>
                            </div>
                            <h1 className="text-xl font-bold text-[#0F2A1D] dark:text-[#E3EED4]">Tourism Portal</h1>
                        </Link>
                        <div className="flex items-center gap-6">
                            <button className="text-[#0F2A1D] dark:text-white font-semibold">Destinations</button>
                            <button className="text-[#6B8071] dark:text-[#AEC3B0] hover:text-[#0F2A1D] dark:hover:text-white transition">
                                Attractions
                            </button>
                            <button className="text-[#6B8071] dark:text-[#AEC3B0] hover:text-[#0F2A1D] dark:hover:text-white transition">
                                Contact
                            </button>
                            <a href="/login" className="px-4 py-2 bg-[#375534] hover:bg-[#0F2A1D] text-white rounded-lg transition">
                                Login
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#375534] to-[#0F2A1D] text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-bold mb-2">Explore Our Destinations</h2>
                    <p className="text-[#E3EED4] text-lg">Find your perfect getaway from our curated collection</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-[#E3EED4] dark:bg-[#0F2A1D] min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Filters */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-[#375534]/20 rounded-2xl p-6 sticky top-24">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-[#0F2A1D] dark:text-[#E3EED4]">Filters</h3>
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="lg:hidden p-2 hover:bg-[#E3EED4] dark:hover:bg-[#375534] rounded-lg"
                                    >
                                        {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
                                    </button>
                                </div>

                                {showFilters && (
                                    <div className="space-y-6">
                                        {/* Price Range */}
                                        <div>
                                            <label className="block text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-3">
                                                Price per Night
                                            </label>
                                            <div className="space-y-2">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="500"
                                                    value={filters.priceRange[1]}
                                                    onChange={(e) =>
                                                        setFilters({
                                                            ...filters,
                                                            priceRange: [filters.priceRange[0], parseInt(e.target.value)],
                                                        })
                                                    }
                                                    className="w-full"
                                                />
                                                <div className="flex justify-between text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                                    <span>${filters.priceRange[0]}</span>
                                                    <span>${filters.priceRange[1]}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rating Filter */}
                                        <div>
                                            <label className="block text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-3">
                                                Minimum Rating
                                            </label>
                                            <div className="space-y-2">
                                                {[0, 4, 4.5, 4.8].map((rating) => (
                                                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="rating"
                                                            checked={filters.rating === rating}
                                                            onChange={() => setFilters({ ...filters, rating })}
                                                            className="w-4 h-4"
                                                        />
                                                        <span className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                                            {rating === 0 ? 'All Ratings' : `${rating}+ Stars`}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Category Filter */}
                                        <div>
                                            <label className="block text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-3">
                                                Category
                                            </label>
                                            <select
                                                value={filters.category}
                                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                                className="w-full px-4 py-2 border border-[#AEC3B0]/40 rounded-lg bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-white"
                                            >
                                                <option value="all">All Categories</option>
                                                <option value="Resort">Resort</option>
                                                <option value="Beach">Beach</option>
                                                <option value="City">City</option>
                                                <option value="Nature">Nature</option>
                                                <option value="Cultural">Cultural</option>
                                            </select>
                                        </div>

                                        {/* Reset Button */}
                                        <button
                                            onClick={() =>
                                                setFilters({
                                                    priceRange: [0, 500],
                                                    rating: 0,
                                                    category: 'all',
                                                })
                                            }
                                            className="w-full px-4 py-2 border-2 border-[#375534] text-[#375534] rounded-lg hover:bg-[#375534] hover:text-white transition"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Destinations Grid */}
                        <div className="lg:col-span-3">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-[#0F2A1D] dark:text-[#E3EED4]">
                                    Results ({filteredDestinations.length})
                                </h3>
                                <select className="px-4 py-2 border border-[#AEC3B0]/40 rounded-lg bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-white">
                                    <option>Sort by: Relevance</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                    <option>Rating: High to Low</option>
                                </select>
                            </div>

                            {filteredDestinations.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredDestinations.map((dest) => (
                                        <div
                                            key={dest.id}
                                            className="rounded-2xl overflow-hidden bg-white dark:bg-[#375534]/20 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
                                        >
                                            <div className="relative h-64 overflow-hidden">
                                                <img
                                                    src={dest.image}
                                                    alt={dest.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute top-4 left-4">
                                                    <span className="px-3 py-1 bg-[#375534] text-white text-xs font-semibold rounded-full">
                                                        {dest.category}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => toggleLike(dest.id)}
                                                    className={`absolute top-4 right-4 p-3 rounded-full transition-all ${
                                                        likedDestinations.includes(dest.id)
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-white/80 text-[#0F2A1D] hover:bg-white'
                                                    }`}
                                                >
                                                    <Heart
                                                        className={`w-6 h-6 ${likedDestinations.includes(dest.id) ? 'fill-current' : ''}`}
                                                    />
                                                </button>
                                            </div>

                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="text-xl font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                                            {dest.name}
                                                        </h4>
                                                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] flex items-center gap-1 mt-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {dest.location}
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-4">
                                                    {dest.description}
                                                </p>

                                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#AEC3B0]/20">
                                                    <div className="flex items-center gap-1">
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${
                                                                        i < Math.floor(dest.rating)
                                                                            ? 'text-yellow-400 fill-yellow-400'
                                                                            : 'text-gray-300'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="ml-2 text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                                            {dest.rating}
                                                        </span>
                                                        <span className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">
                                                            ({dest.reviews} reviews)
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-2xl font-bold text-[#375534] dark:text-[#E3EED4]">
                                                            ${dest.price}
                                                        </span>
                                                        <span className="text-xs text-[#6B8071] dark:text-[#AEC3B0] ml-1">
                                                            /night
                                                        </span>
                                                    </div>
                                                    <button className="px-4 py-2 bg-[#375534] text-white rounded-lg hover:bg-[#0F2A1D] transition font-medium">
                                                        Book Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0]">
                                        No destinations match your filters. Try adjusting your criteria.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-[#0F2A1D] text-[#E3EED4] py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h5 className="font-bold text-lg mb-4">About Us</h5>
                            <p className="text-sm text-[#AEC3B0]">
                                Your trusted tourism portal for discovering amazing destinations.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-bold text-lg mb-4">Quick Links</h5>
                            <ul className="space-y-2 text-sm text-[#AEC3B0]">
                                <li><Link href="/portal" className="hover:text-white transition">Home</Link></li>
                                <li><Link href="/portal/destinations" className="hover:text-white transition">Destinations</Link></li>
                                <li><a href="#" className="hover:text-white transition">Attractions</a></li>
                                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold text-lg mb-4">Legal</h5>
                            <ul className="space-y-2 text-sm text-[#AEC3B0]">
                                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold text-lg mb-4">Contact</h5>
                            <p className="text-sm text-[#AEC3B0]">
                                <strong>Email:</strong> info@tourism.com<br />
                                <strong>Phone:</strong> +1 (555) 123-4567
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-[#375534] pt-8 text-center text-sm text-[#AEC3B0]">
                        <p>&copy; 2026 Tourism Management System. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
