import { Head } from '@inertiajs/react';
import TouristLayout from '@/layouts/app/tourist-layout';
import { MapPin, Star, Users, Search, Filter, Wifi, Utensils, Bed } from 'lucide-react';
import { useState } from 'react';

const accommodations = [
    {
        id: 1,
        title: 'Luxury Ocean Resort',
        location: 'Maldives',
        price: '$250/night',
        rating: 4.9,
        rooms: 50,
        image: 'https://via.placeholder.com/300x200/375534/ffffff?text=Ocean+Resort',
        description: 'All-inclusive resort with private beach and water sports.',
        amenities: ['WiFi', 'Restaurant', 'Spa', 'Pool'],
        type: 'Resort',
    },
    {
        id: 2,
        title: 'Boutique City Hotel',
        location: 'Barcelona, Spain',
        price: '$120/night',
        rating: 4.7,
        rooms: 45,
        image: 'https://via.placeholder.com/300x200/375534/ffffff?text=City+Hotel',
        description: 'Charming hotel in the heart of Barcelona\'s Gothic Quarter.',
        amenities: ['WiFi', 'Restaurant', 'Bar', 'Gym'],
        type: 'Hotel',
    },
    {
        id: 3,
        title: 'Alpine Cabin Lodge',
        location: 'Swiss Alps',
        price: '$85/night',
        rating: 4.8,
        rooms: 30,
        image: 'https://via.placeholder.com/300x200/375534/ffffff?text=Alpine+Cabin',
        description: 'Cozy mountain lodge perfect for hiking and nature lovers.',
        amenities: ['WiFi', 'Restaurant', 'Fireplace', 'Sauna'],
        type: 'Lodge',
    },
    {
        id: 4,
        title: 'Beach Bungalows',
        location: 'Bali, Indonesia',
        price: '$60/night',
        rating: 4.6,
        rooms: 40,
        image: 'https://via.placeholder.com/300x200/375534/ffffff?text=Beach+Bungalows',
        description: 'Tropical bungalows with direct beach access and sunset views.',
        amenities: ['WiFi', 'Restaurant', 'Pool', 'Beach Bar'],
        type: 'Bungalow',
    },
    {
        id: 5,
        title: 'Historic Castle Hotel',
        location: 'Edinburgh, Scotland',
        price: '$140/night',
        rating: 4.8,
        rooms: 35,
        image: 'https://via.placeholder.com/300x200/375534/ffffff?text=Castle+Hotel',
        description: 'Unique experience in a restored historic castle overlooking the city.',
        amenities: ['WiFi', 'Restaurant', 'Library', 'Heritage Tours'],
        type: 'Historic',
    },
    {
        id: 6,
        title: 'Urban Apartment Suites',
        location: 'Tokyo, Japan',
        price: '$95/night',
        rating: 4.7,
        rooms: 60,
        image: 'https://via.placeholder.com/300x200/375534/ffffff?text=Apartment+Suites',
        description: 'Modern apartments with kitchens and living spaces in trendy districts.',
        amenities: ['WiFi', 'Laundry', 'Concierge', 'Gym'],
        type: 'Apartment',
    },
];

export default function Accommodations() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredAccommodations, setFilteredAccommodations] = useState(accommodations);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredAccommodations(accommodations);
        } else {
            setFilteredAccommodations(
                accommodations.filter(
                    (accommodation) =>
                        accommodation.title.toLowerCase().includes(query.toLowerCase()) ||
                        accommodation.location.toLowerCase().includes(query.toLowerCase())
                )
            );
        }
    };

    return (
        <TouristLayout>
            <Head title="Accommodations" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#375534] to-[#6B8071] p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Accommodations</h1>
                    <p className="text-[#E3EED4]">Find the perfect place to stay during your travels</p>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B8071] dark:text-[#AEC3B0]" />
                        <input
                            type="text"
                            placeholder="Search accommodations..."
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

                {/* Accommodations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAccommodations.map((accommodation) => (
                        <div
                            key={accommodation.id}
                            className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            {/* Image */}
                            <div className="relative h-48 bg-gray-200">
                                <img
                                    src={accommodation.image}
                                    alt={accommodation.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-[#375534] text-white text-xs font-medium">
                                    {accommodation.type}
                                </div>
                                <div className="absolute top-3 right-3 bg-white dark:bg-[#0F2A1D] px-3 py-1 rounded-lg shadow-sm flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    <span className="text-sm font-medium text-[#0F2A1D] dark:text-white">{accommodation.rating}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-2">{accommodation.title}</h3>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-4 line-clamp-2">{accommodation.description}</p>

                                {/* Details */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                        <MapPin className="w-4 h-4" />
                                        {accommodation.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                        <Bed className="w-4 h-4" />
                                        {accommodation.rooms} rooms available
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div className="mb-4 flex gap-2 flex-wrap">
                                    {accommodation.amenities.slice(0, 3).map((amenity, idx) => (
                                        <span key={idx} className="text-xs px-2 py-1 rounded-full bg-[#E3EED4] dark:bg-[#375534]/30 text-[#6B8071] dark:text-[#AEC3B0]">
                                            {amenity}
                                        </span>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <p className="text-[#C84B59] dark:text-[#E89BA3] font-semibold">{accommodation.price}</p>
                                    <button className="px-4 py-2 rounded-lg bg-[#375534] text-white hover:bg-[#2d4227] transition-colors font-medium text-sm">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {filteredAccommodations.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-[#6B8071] dark:text-[#AEC3B0]">No accommodations found matching your search.</p>
                    </div>
                )}
            </div>
        </TouristLayout>
    );
}
