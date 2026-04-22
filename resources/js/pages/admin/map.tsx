import { Head } from '@inertiajs/react';
import { useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import AppLayout from '@/layouts/app-layout';
import { Map, AlertCircle, MapPin, Loader } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Attractions Map',
        href: '/map',
    },
];

interface MockAttraction {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    category: string;
    entry_fee: number | null;
    crowd_count: number;
    status: 'active' | 'inactive';
}

// Default mock data (fallback if no attractions in database)
const defaultMockAttractions: MockAttraction[] = [
    {
        id: 1,
        name: 'Mountain Peak Viewpoint',
        latitude: 16.8409,
        longitude: 121.7949,
        category: 'Natural',
        entry_fee: 150,
        crowd_count: 0,
        status: 'active',
    },
    {
        id: 2,
        name: 'Historical Fort Museum',
        latitude: 16.8450,
        longitude: 121.7900,
        category: 'Historical',
        entry_fee: 200,
        crowd_count: 0,
        status: 'active',
    },
    {
        id: 3,
        name: 'Botanical Gardens',
        latitude: 16.8380,
        longitude: 121.7980,
        category: 'Nature',
        entry_fee: 100,
        crowd_count: 0,
        status: 'active',
    },
    {
        id: 4,
        name: 'Beach Resort',
        latitude: 16.8500,
        longitude: 121.7850,
        category: 'Beach',
        entry_fee: 50,
        crowd_count: 0,
        status: 'active',
    },
    {
        id: 5,
        name: 'Cultural Heritage Center',
        latitude: 16.8420,
        longitude: 121.7920,
        category: 'Cultural',
        entry_fee: 75,
        crowd_count: 0,
        status: 'inactive',
    },
    {
        id: 6,
        name: 'Adventure Park',
        latitude: 16.8470,
        longitude: 121.7800,
        category: 'Adventure',
        entry_fee: 300,
        crowd_count: 0,
        status: 'active',
    },
];

interface PageProps {
    attractions?: MockAttraction[];
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const defaultCenter = {
    lat: 16.8409,
    lng: 121.7949,
};

// Validate and ensure coordinates are valid numbers
const isValidCoordinate = (lat: any, lng: any): boolean => {
    const latitude = Number(lat);
    const longitude = Number(lng);
    
    return (
        !isNaN(latitude) && 
        !isNaN(longitude) && 
        latitude >= -90 && latitude <= 90 && 
        longitude >= -180 && longitude <= 180
    );
};

// Helper function to ensure crowd_count exists with a default
const normalizeAttraction = (attraction: any): MockAttraction => ({
    ...attraction,
    crowd_count: attraction.crowd_count ?? 0,
});

export default function MapPage({ attractions = defaultMockAttractions }: PageProps) {
    const normalizedAttractions = (attractions || defaultMockAttractions).map(normalizeAttraction);
    const [selectedAttraction, setSelectedAttraction] = useState<MockAttraction | null>(null);
    const mapRef = useRef<any>(null);
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    const handleMarkerClick = useCallback((attraction: MockAttraction) => {
        setSelectedAttraction(normalizeAttraction(attraction));
        panToAttraction(attraction);
    }, []);

    const panToAttraction = (attraction: MockAttraction) => {
        if (!isValidCoordinate(attraction.latitude, attraction.longitude)) {
            console.warn(`Invalid coordinates for ${attraction.name}:`, {
                latitude: attraction.latitude,
                longitude: attraction.longitude,
            });
            return;
        }

        if (mapRef.current) {
            mapRef.current.panTo({
                lat: Number(attraction.latitude),
                lng: Number(attraction.longitude),
            });
            mapRef.current.setZoom(16);
        }
    };

    const handleAttractionSelectFromList = (attraction: MockAttraction) => {
        setSelectedAttraction(normalizeAttraction(attraction));
        panToAttraction(attraction);
    };

    const getMarkerIcon = (status: string) => {
        return {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: status === 'active' ? '#375534' : '#6B8071',
            fillOpacity: 1,
            strokeColor: '#0F2A1D',
            strokeWeight: 2,
        };
    };

    if (loadError) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Attractions Map" />
                <div className="grid gap-6 py-6 px-6">
                    <div className="rounded-lg border p-4" style={{ borderColor: '#E74C3C', backgroundColor: '#FADBD8' }}>
                        <div className="flex gap-3">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#C0392B' }} />
                            <div>
                                <p className="font-semibold" style={{ color: '#C0392B' }}>
                                    Error Loading Map
                                </p>
                                <p className="text-sm mt-1" style={{ color: '#A93226' }}>
                                    {loadError.message}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!isLoaded) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Attractions Map" />
                <div className="grid gap-6 py-6 px-6">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <Loader className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: '#375534' }} />
                            <p style={{ color: '#0F2A1D' }} className="font-medium">
                                Loading map...
                            </p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attractions Map" />

            <div className="grid gap-6 py-6 px-6">
                

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map Container */}
                    <div className="lg:col-span-2">
                        <div className="rounded-lg border overflow-hidden shadow-sm" style={{ borderColor: '#AEC3B0', backgroundColor: '#E3EED4', height: '600px' }}>
                            <GoogleMap 
                                mapContainerStyle={mapContainerStyle} 
                                center={defaultCenter} 
                                zoom={14}
                                onLoad={(map) => {
                                    mapRef.current = map;
                                }}
                                options={{
                                styles: [
                                    {
                                        featureType: 'water',
                                        elementType: 'geometry',
                                        stylers: [{ color: '#E3EED4' }],
                                    },
                                    {
                                        featureType: 'landscape',
                                        elementType: 'geometry',
                                        stylers: [{ color: '#F5F9F0' }],
                                    },
                                    {
                                        featureType: 'road',
                                        elementType: 'geometry',
                                        stylers: [{ color: '#FFFFFF' }],
                                    },
                                    {
                                        featureType: 'poi',
                                        elementType: 'labels.text.fill',
                                        stylers: [{ color: '#0F2A1D' }],
                                    },
                                ],
                                clickableIcons: false,
                            }}>
                                {/* Markers for attractions */}
                                {normalizedAttractions
                                    .filter(attraction => isValidCoordinate(attraction.latitude, attraction.longitude))
                                    .map((attraction) => (
                                        <Marker
                                            key={attraction.id}
                                            position={{ lat: Number(attraction.latitude), lng: Number(attraction.longitude) }}
                                            icon={{
                                                path: google.maps.SymbolPath.CIRCLE,
                                                scale: 10,
                                                fillColor: attraction.status === 'active' ? '#375534' : '#6B8071',
                                                fillOpacity: 1,
                                                strokeColor: '#0F2A1D',
                                                strokeWeight: 2,
                                            }}
                                            onClick={() => handleMarkerClick(attraction)}
                                        />
                                    ))}

                                {/* Info Window for selected attraction */}
                                {selectedAttraction && 
                                 isValidCoordinate(selectedAttraction.latitude, selectedAttraction.longitude) && (
                                    <InfoWindow
                                        position={{
                                            lat: Number(selectedAttraction.latitude),
                                            lng: Number(selectedAttraction.longitude),
                                        }}
                                        onCloseClick={() => setSelectedAttraction(null)}
                                        options={{
                                            pixelOffset: new google.maps.Size(0, -40),
                                        }}
                                    >
                                        <div
                                            style={{
                                                backgroundColor: '#FFFFFF',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                minWidth: '250px',
                                                boxShadow: '0 2px 8px rgba(15, 42, 29, 0.15)',
                                            }}
                                        >
                                            <h3 style={{ color: '#0F2A1D', fontWeight: 'bold', marginBottom: '6px' }}>
                                                {selectedAttraction.name}
                                            </h3>
                                            <p style={{ color: '#375534', fontSize: '12px', margin: '4px 0' }}>
                                                Category: {selectedAttraction.category}
                                            </p>
                                            <p style={{ color: '#375534', fontSize: '12px', margin: '4px 0' }}>
                                                Crowd Today: {selectedAttraction.crowd_count} visitors
                                            </p>
                                            <p style={{ color: '#375534', fontSize: '12px', margin: '4px 0' }}>
                                                Entry Fee: {selectedAttraction.entry_fee ? `₱${selectedAttraction.entry_fee}` : 'Free'}
                                            </p>
                                        </div>
                                    </InfoWindow>
                                )}
                            </GoogleMap>
                        </div>
                    </div>

                    {/* Attractions Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="rounded-lg border overflow-hidden shadow-sm" style={{ borderColor: '#AEC3B0', backgroundColor: '#ffffff', height: '600px', display: 'flex', flexDirection: 'column' }}>
                            <div className="p-4 border-b" style={{ borderColor: '#AEC3B0' }}>
                                <h2 className="font-semibold" style={{ color: '#0F2A1D' }}>
                                    Attractions
                                </h2>
                                <p className="text-sm" style={{ color: '#375534' }}>
                                    {normalizedAttractions.length} locations
                                </p>
                            </div>

                            {/* Attractions List */}
                            <div style={{ overflowY: 'auto', flex: 1 }}>
                                {normalizedAttractions.map((attraction) => (
                                    <div
                                        key={attraction.id}
                                        onClick={() => handleAttractionSelectFromList(attraction)}
                                        className="cursor-pointer transition"
                                        style={{
                                            padding: '12px',
                                            borderBottom: '1px solid #AEC3B0',
                                            backgroundColor:
                                                selectedAttraction?.id === attraction.id ? '#E3EED4' : '#FFFFFF',
                                            borderLeft: selectedAttraction?.id === attraction.id ? '4px solid #375534' : 'none',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedAttraction?.id !== attraction.id) {
                                                e.currentTarget.style.backgroundColor = '#F5F9F0';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedAttraction?.id !== attraction.id) {
                                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                                            }
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-medium text-sm flex-1" style={{ color: '#0F2A1D' }}>
                                                {attraction.name}
                                            </h3>
                                            <div
                                                className="px-2 py-1 text-xs font-medium rounded"
                                                style={{
                                                    backgroundColor: attraction.status === 'active' ? '#375534' : '#AEC3B0',
                                                    color: attraction.status === 'active' ? '#E3EED4' : '#0F2A1D',
                                                }}
                                            >
                                                {attraction.status}
                                            </div>
                                        </div>

                                        <div className="space-y-1 text-xs" style={{ color: '#375534' }}>
                                            <div className="flex justify-between">
                                                <span>Category:</span>
                                                <span className="font-medium">{attraction.category}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Crowd Today:</span>
                                                <span className="font-medium">{attraction.crowd_count} visitors</span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span>Entry Fee:</span>
                                                <span className="font-medium">
                                                    {attraction.entry_fee ? `₱${attraction.entry_fee}` : 'Free'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Attraction Details */}
                {selectedAttraction && (
                    <div className="rounded-lg border overflow-hidden shadow-sm p-6" style={{ borderColor: '#AEC3B0', backgroundColor: '#FFFFFF' }}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold" style={{ color: '#0F2A1D' }}>
                                    {selectedAttraction.name}
                                </h2>
                                <p className="text-sm" style={{ color: '#375534' }}>
                                    <MapPin className="inline h-4 w-4 mr-1" />
                                    {selectedAttraction.latitude.toFixed(4)}, {selectedAttraction.longitude.toFixed(4)}
                                </p>
                            </div>
                            <div
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                style={{
                                    backgroundColor: selectedAttraction.status === 'active' ? '#375534' : '#AEC3B0',
                                    color: selectedAttraction.status === 'active' ? '#E3EED4' : '#0F2A1D',
                                }}
                            >
                                {selectedAttraction.status}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{ backgroundColor: '#E3EED4' }}
                            >
                                <p className="text-xs" style={{ color: '#6B8071' }}>
                                    Category
                                </p>
                                <p className="font-semibold" style={{ color: '#0F2A1D' }}>
                                    {selectedAttraction.category}
                                </p>
                            </div>

                            <div
                                className="p-3 rounded-lg"
                                style={{ backgroundColor: '#E3EED4' }}
                            >
                                <p className="text-xs" style={{ color: '#6B8071' }}>
                                    Crowd Today
                                </p>
                                <p className="font-semibold" style={{ color: '#0F2A1D' }}>
                                    {selectedAttraction.crowd_count} visitors
                                </p>
                            </div>

                            <div
                                className="p-3 rounded-lg"
                                style={{ backgroundColor: '#E3EED4' }}
                            >
                                <p className="text-xs" style={{ color: '#6B8071' }}>
                                    Entry Fee
                                </p>
                                <p className="font-semibold" style={{ color: '#0F2A1D' }}>
                                    {selectedAttraction.entry_fee ? `₱${selectedAttraction.entry_fee}` : 'Free'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
