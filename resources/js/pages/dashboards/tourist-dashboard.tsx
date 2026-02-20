import { Head } from '@inertiajs/react';
import TouristLayout from '@/layouts/app/tourist-layout';
import { MapPin, Star } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSystemNotifications } from '@/hooks/use-system-notifications';

interface Attraction {
    id: number;
    title: string;
    location: string;
    rating: number;
    price: string;
    image: string;
    latitude: number;
    longitude: number;
}

interface FeaturedAccommodation {
    id: number;
    title: string;
    price?: string;
    image: string;
    description: string;
    location: string;
    rating: number;
    latitude?: number;
    longitude?: number;
    guides: Array<{
        id: number;
        name: string;
        role: string;
    }>;
}

interface Props {
    featuredAccommodation: FeaturedAccommodation | null;
    attractions: Attraction[];
    operators?: Array<{
        id: number;
        name: string;
        email: string;
        username: string;
    }>;
}

export default function TouristDashboard({ featuredAccommodation = null, attractions = [], operators = [] }: Props) {
    const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
    const mapContainer = useRef<HTMLDivElement>(null);
    const { info } = useSystemNotifications();
    
    // Show welcome notification on mount
    useEffect(() => {
        info('Welcome!', 'Explore amazing destinations and book your next adventure');
    }, [info]);
    
    const displayedAccommodation: FeaturedAccommodation | null = selectedAttraction ? {
        id: selectedAttraction.id,
        title: selectedAttraction.title,
        image: selectedAttraction.image,
        description: `Discover ${selectedAttraction.title}. A wonderful destination offering unique experiences and unforgettable memories.`,
        location: selectedAttraction.location,
        rating: selectedAttraction.rating,
        latitude: selectedAttraction.latitude,
        longitude: selectedAttraction.longitude,
        guides: [
            { id: 1, name: 'Local Guide', role: `${selectedAttraction.rating} rating` },
        ],
    } : featuredAccommodation;

    // Initialize map when component mounts or accommodation changes
    useEffect(() => {
        if (mapContainer.current && displayedAccommodation && typeof window !== 'undefined') {
            loadMap();
        }
    }, [displayedAccommodation]);

    const loadMap = () => {
        // Check if Leaflet is already loaded
        if ((window as any).L) {
            initializeMap();
            return;
        }

        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS with error handling
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        
        script.onload = () => {
            console.log('Leaflet loaded successfully');
            // Wait a tick to ensure Leaflet is fully initialized
            setTimeout(() => {
                initializeMap();
            }, 100);
        };

        script.onerror = () => {
            console.error('Failed to load Leaflet library');
            if (mapContainer.current) {
                mapContainer.current.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; border-radius: 8px;">
                        <div style="text-align: center; color: #666;">
                            <p style="font-weight: 500; margin-bottom: 8px;">📍 ${displayedAccommodation?.location || 'Badian, Philippines'}</p>
                            <p style="font-size: 12px; color: #999;">Map service unavailable</p>
                        </div>
                    </div>
                `;
            }
        };

        document.head.appendChild(script);
    };

    const initializeMap = () => {
        const L = (window as any).L;
        
        if (!L) {
            console.error('Leaflet not loaded yet');
            setTimeout(() => initializeMap(), 500);
            return;
        }

        if (!mapContainer.current) {
            console.error('Map container not found');
            return;
        }

        try {
            // Check if map already exists on container
            if ((mapContainer.current as any)._leaflet_id) {
                console.log('Removing existing map instance');
                const children = mapContainer.current.children;
                while (children.length > 0) {
                    children[0].remove();
                }
            }

            // Get coordinates
            const lat = displayedAccommodation?.latitude ?? 9.4619;
            const lng = displayedAccommodation?.longitude ?? 123.7473;

            console.log('Creating map with coordinates:', { lat, lng });

            // Create map with explicit options
            const map = L.map(mapContainer.current, {
                center: [lat, lng],
                zoom: 15,
                scrollWheelZoom: true,
                doubleClickZoom: true,
            });

            // Add OpenStreetMap tiles with crossOrigin
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                minZoom: 1,
                attribution: '© OpenStreetMap contributors',
                crossOrigin: 'anonymous',
            }).addTo(map);

            // Add marker
            const marker = L.marker([lat, lng])
                .bindPopup(`<strong>${displayedAccommodation?.title || 'Location'}</strong><br><em>${displayedAccommodation?.location || 'Badian, Philippines'}</em>`)
                .addTo(map);
            
            marker.openPopup();

            // Force map to recalculate size
            setTimeout(() => {
                map.invalidateSize();
            }, 300);

            console.log('Map initialized successfully');

        } catch (error) {
            console.error('Map initialization error:', error);
            
            // Fallback display
            if (mapContainer.current) {
                mapContainer.current.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; width: 100%; background: #f0f0f0; border-radius: 8px; font-family: system-ui, -apple-system, sans-serif;">
                        <div style="text-align: center; color: #666;">
                            <p style="font-weight: 500; margin: 0 0 8px 0; font-size: 14px;">📍 ${displayedAccommodation?.location || 'Badian, Philippines'}</p>
                            <p style="margin: 0; font-size: 12px; color: #999;">Coordinates: ${displayedAccommodation?.latitude ?? 9.4619}, ${displayedAccommodation?.longitude ?? 123.7473}</p>
                        </div>
                    </div>
                `;
            }
        }
    };
    return (
        <TouristLayout>
            <Head title="Tourist Dashboard" />
            <div className="flex h-full flex-1 gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Left Section - Featured Accommodation */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Featured Card */}
                    {displayedAccommodation ? (
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                            {/* Image Section */}
                            <div className="relative h-80 bg-gray-200">
                                <img 
                                    src={displayedAccommodation.image} 
                                    alt={displayedAccommodation.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Content Section */}
                            <div className="p-6">
                                {/* Title and Rating */}
                                <div className="flex items-start justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{displayedAccommodation.title}</h2>
                                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-lg">
                                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">{displayedAccommodation.rating}</span>
                                    </div>
                                </div>

                                {/* Location */}
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-6 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {displayedAccommodation.location}
                                </p>

                                {/* Tabs */}
                                <div className="border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 mb-6">
                                    <div className="flex gap-8">
                                        <button className="py-3 border-b-2 border-[#C84B59] text-[#C84B59] dark:text-[#E89BA3] font-medium text-sm">
                                            Overview
                                        </button>
                                        <button className="py-3 text-[#6B8071] dark:text-[#AEC3B0] font-medium text-sm hover:text-[#0F2A1D] dark:hover:text-white transition-colors">
                                            Details
                                        </button>
                                        <button className="py-3 text-[#6B8071] dark:text-[#AEC3B0] font-medium text-sm hover:text-[#0F2A1D] dark:hover:text-white transition-colors">
                                            Reviews
                                        </button>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-8 leading-relaxed">
                                    {displayedAccommodation.description}
                                </p>

                                {/* Tour Guides Section */}
                                <div className="mb-8">
                                    <h3 className="font-semibold text-[#0F2A1D] dark:text-white mb-4">Tour Guides</h3>
                                    <div className="flex gap-6">
                                        {displayedAccommodation.guides.map((guide) => (
                                            <div key={guide.id} className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#375534] to-[#6B8071] flex items-center justify-center text-white font-semibold">
                                                    {guide.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#0F2A1D] dark:text-white text-sm">{guide.name}</p>
                                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">{guide.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Map Placeholder */}
                                <div className="mb-8">
                                    <h3 className="font-semibold text-[#0F2A1D] dark:text-white mb-4">Location</h3>
                                    <div 
                                        ref={mapContainer}
                                        className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40"
                                        style={{ height: '400px', width: '100%', position: 'relative' }}
                                    />
                                </div>

                                {/* Nearby Places */}
                                <div>
                                    <h3 className="font-semibold text-[#0F2A1D] dark:text-white mb-4">Nearby Places</h3>
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        <button className="px-4 py-2 rounded-full bg-[#C84B59] dark:bg-[#C84B59] text-white font-medium text-sm whitespace-nowrap hover:bg-[#B03A47] transition-colors">
                                            School
                                        </button>
                                        <button className="px-4 py-2 rounded-full border border-[#AEC3B0]/40 dark:border-[#375534]/40 text-[#6B8071] dark:text-[#AEC3B0] font-medium text-sm whitespace-nowrap hover:bg-[#E3EED4] dark:hover:bg-[#375534]/20 transition-colors">
                                            Bus Stand
                                        </button>
                                        <button className="px-4 py-2 rounded-full border border-[#AEC3B0]/40 dark:border-[#375534]/40 text-[#6B8071] dark:text-[#AEC3B0] font-medium text-sm whitespace-nowrap hover:bg-[#E3EED4] dark:hover:bg-[#375534]/20 transition-colors">
                                            Hospital
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                            <p className="text-center text-[#6B8071] dark:text-[#AEC3B0]">No accommodations available</p>
                        </div>
                    )}
                </div>

                {/* Right Section - Places You May Like */}
                <div className="w-80 flex flex-col">
                    <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-4">Places you may like</h2>
                    <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                        {attractions.length > 0 ? (
                            attractions.map((place) => (
                                <div 
                                    key={place.id}
                                    onClick={() => setSelectedAttraction(place)}
                                    className={`rounded-xl border shadow-sm overflow-hidden transition-all cursor-pointer ${
                                        selectedAttraction?.id === place.id
                                            ? 'border-[#C84B59] dark:border-[#E89BA3] shadow-md bg-white dark:bg-[#0F2A1D]'
                                            : 'border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] hover:shadow-md'
                                    }`}
                                >
                                    {/* Image */}
                                    <div className="relative h-32 bg-gray-200">
                                        <img 
                                            src={place.image} 
                                            alt={place.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 bg-white dark:bg-[#0F2A1D] px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                            <span className="text-xs font-medium text-[#0F2A1D] dark:text-white">{place.rating}</span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <h3 className="font-semibold text-[#0F2A1D] dark:text-white text-sm mb-1">{place.title}</h3>
                                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-3 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {place.location}
                                        </p>
                                        <p className="text-[#C84B59] dark:text-[#E89BA3] font-semibold text-sm">{place.price}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] p-6 text-center">
                                <p className="text-[#6B8071] dark:text-[#AEC3B0]">No attractions available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Operators Listing Section */}
            <div className="p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                <h2 className="text-2xl font-bold text-[#0F2A1D] dark:text-white mb-6">Available Tour Operators</h2>
                {operators.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {operators.map((operator) => (
                            <div
                                key={operator.id}
                                className="rounded-xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                            >
                                {/* Avatar */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#375534] to-[#6B8071] flex items-center justify-center text-white text-xl font-bold">
                                        {operator.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-[#0F2A1D] dark:text-white text-lg">{operator.name}</h3>
                                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">@{operator.username}</p>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="border-t border-[#AEC3B0]/20 dark:border-[#375534]/20 pt-4">
                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-3">
                                        <span className="font-medium">Email:</span><br />
                                        {operator.email}
                                    </p>
                                    <button className="w-full bg-[#C84B59] dark:bg-[#C84B59] text-white font-medium text-sm py-2 rounded-lg hover:bg-[#B03A47] transition-colors">
                                        Contact Operator
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-12 text-center">
                        <p className="text-[#6B8071] dark:text-[#AEC3B0] text-lg">No operators available</p>
                    </div>
                )}
            </div>
        </TouristLayout>
    );
}
