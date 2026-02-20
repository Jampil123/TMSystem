import { Head } from '@inertiajs/react';
import TouristLayout from '@/layouts/app/tourist-layout';
import { MapPin, Star, Users, Search, Filter, Eye } from 'lucide-react';
import { useState } from 'react';

const attractions = [
    {
        id: 1,
        title: 'Eiffel Tower',
        location: 'Paris, France',
        rating: 4.9,
        visitors: '7.0M',
        entryFee: '$15',
        image: 'https://via.placeholder.com/300x200/375534/ffffff?text=Eiffel+Tower',
        description: 'Iconic iron lattice monument offering panoramic views of Paris.',
        category: 'Historical',
    },
    {
        id: 2,
        title: 'Statue of Liberty',
        location: 'New York, USA',
        rating: 4.8,
        visitors: '4.5M',
        entryFee: '$24',
        image: 'https://via.placeholder.com/300x200/375534/ffffff?text=Statue+of+Liberty',
        description: 'Colossal neoclassical sculpture symbolizing freedom and democracy.',
        category: 'Monument',
    },
    {
        id: 3,
        title: 'Great Wall of China',
        location: 'China',
        rating: 4.8,
        visitors: '10.0M',
        entryFee: '$10',
        image: 'https://via.placeholder.com/300x200/375534/ffffff?text=Great+Wall',
        description: 'Ancient fortification offering stunning hiking and historical insights.',
        category: 'Historical',
    },
    {
        id: 4,
        title: 'Taj Mahal',
        location: 'Agra, India',
        rating: 4.9,
        visitors: '8.0M',
        entryFee: '$20',
        image: 'https://via.placeholder.com/300x200/375534/ffffff?text=Taj+Mahal',
        description: 'Magnificent white marble mausoleum representing eternal love.',
        category: 'Monument',
    },
    {
        id: 5,
        title: 'Christ the Redeemer',
        location: 'Rio de Janeiro, Brazil',
        rating: 4.7,
        visitors: '2.0M',
        entryFee: '$18',
        image: 'https://via.placeholder.com/300x200/375534/ffffff?text=Christ+Redeemer',
        description: 'Art Deco statue providing breathtaking views of Rio de Janeiro.',
        category: 'Monument',
    },
    {
        id: 6,
        title: 'Colosseum',
        location: 'Rome, Italy',
        rating: 4.8,
        visitors: '7.5M',
        entryFee: '$16',
        image: 'https://via.placeholder.com/300x200/375534/ffffff?text=Colosseum',
        description: 'Ancient amphitheater and symbol of Imperial Rome.',
        category: 'Historical',
    },
];

export default function Attractions() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredAttractions, setFilteredAttractions] = useState(attractions);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredAttractions(attractions);
        } else {
            setFilteredAttractions(
                attractions.filter(
                    (attraction) =>
                        attraction.title.toLowerCase().includes(query.toLowerCase()) ||
                        attraction.location.toLowerCase().includes(query.toLowerCase())
                )
            );
        }
    };

    return (
        <TouristLayout>
            <Head title="Attractions" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#375534] to-[#6B8071] p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Popular Attractions</h1>
                    <p className="text-[#E3EED4]">Explore world-renowned landmarks and must-see destinations</p>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B8071] dark:text-[#AEC3B0]" />
                        <input
                            type="text"
                            placeholder="Search attractions..."
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

                {/* Attractions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAttractions.map((attraction) => (
                        <div
                            key={attraction.id}
                            className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            {/* Image */}
                            <div className="relative h-48 bg-gray-200">
                                <img
                                    src={attraction.image}
                                    alt={attraction.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-[#375534] text-white text-xs font-medium">
                                    {attraction.category}
                                </div>
                                <div className="absolute top-3 right-3 bg-white dark:bg-[#0F2A1D] px-3 py-1 rounded-lg shadow-sm flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    <span className="text-sm font-medium text-[#0F2A1D] dark:text-white">{attraction.rating}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-2">{attraction.title}</h3>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-4 line-clamp-2">{attraction.description}</p>

                                {/* Details */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                        <MapPin className="w-4 h-4" />
                                        {attraction.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                        <Eye className="w-4 h-4" />
                                        {attraction.visitors} annual visitors
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <p className="text-[#C84B59] dark:text-[#E89BA3] font-semibold">{attraction.entryFee}</p>
                                    <button className="px-4 py-2 rounded-lg bg-[#375534] text-white hover:bg-[#2d4227] transition-colors font-medium text-sm">
                                        Learn More
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {filteredAttractions.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-[#6B8071] dark:text-[#AEC3B0]">No attractions found matching your search.</p>
                    </div>
                )}
            </div>
        </TouristLayout>
    );
}
