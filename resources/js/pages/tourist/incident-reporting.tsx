import { Head } from '@inertiajs/react';
import TouristLayout from '@/layouts/app/tourist-layout';
import { AlertTriangle, MapPin, Clock, Plus } from 'lucide-react';
import { useState } from 'react';

const incidents = [
    {
        id: 1,
        title: 'Road Closure on Main Street',
        location: 'Paris, France',
        severity: 'High',
        date: '2026-02-20',
        time: '14:30',
        description: 'Main street is temporarily closed due to road works. Alternative routes available.',
        status: 'Active',
    },
    {
        id: 2,
        title: 'Weather Alert - Heavy Rain',
        location: 'Bangkok, Thailand',
        severity: 'Medium',
        date: '2026-02-20',
        time: '10:15',
        description: 'Heavy rainfall expected in the evening. Outdoor activities may be affected.',
        status: 'Active',
    },
    {
        id: 3,
        title: 'Attraction Temporarily Closed',
        location: 'Barcelona, Spain',
        severity: 'Medium',
        date: '2026-02-19',
        time: '09:00',
        description: 'Sagrada Familia will be closed for maintenance until February 25.',
        status: 'Resolved',
    },
    {
        id: 4,
        title: 'Public Transport Delay',
        location: 'Tokyo, Japan',
        severity: 'Low',
        date: '2026-02-19',
        time: '16:45',
        description: 'Minor delays on the Yamanote Line. Service expected to resume shortly.',
        status: 'Resolved',
    },
];

const severityColors = {
    High: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200',
    Medium: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    Low: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200',
};

const statusColors = {
    Active: 'bg-red-500',
    Resolved: 'bg-green-500',
};

export default function IncidentReporting() {
    const [selectedTab, setSelectedTab] = useState<'active' | 'resolved'>('active');

    const filteredIncidents = incidents.filter((incident) =>
        selectedTab === 'active' ? incident.status === 'Active' : incident.status === 'Resolved'
    );

    return (
        <TouristLayout>
            <Head title="Incident Reporting" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#375534] to-[#6B8071] p-8 text-white shadow-lg flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Incident Reporting & Risk Management</h1>
                        <p className="text-[#E3EED4]">Stay informed about safety alerts and incidents</p>
                    </div>
                    <button className="px-6 py-3 rounded-lg bg-white text-[#375534] hover:bg-[#E3EED4] transition-colors font-medium flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Report Incident
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-[#AEC3B0]/40 dark:border-[#375534]/40">
                    <button
                        onClick={() => setSelectedTab('active')}
                        className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                            selectedTab === 'active'
                                ? 'border-[#C84B59] text-[#C84B59]'
                                : 'border-transparent text-[#6B8071] dark:text-[#AEC3B0] hover:text-[#0F2A1D] dark:hover:text-white'
                        }`}
                    >
                        Active Incidents ({incidents.filter((i) => i.status === 'Active').length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('resolved')}
                        className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                            selectedTab === 'resolved'
                                ? 'border-[#C84B59] text-[#C84B59]'
                                : 'border-transparent text-[#6B8071] dark:text-[#AEC3B0] hover:text-[#0F2A1D] dark:hover:text-white'
                        }`}
                    >
                        Resolved ({incidents.filter((i) => i.status === 'Resolved').length})
                    </button>
                </div>

                {/* Incidents List */}
                <div className="space-y-4">
                    {filteredIncidents.map((incident) => (
                        <div
                            key={incident.id}
                            className={`rounded-lg border p-6 ${
                                severityColors[incident.severity as keyof typeof severityColors]
                            }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-base">{incident.title}</h3>
                                        <p className="text-sm mt-1 opacity-90">{incident.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`w-3 h-3 rounded-full ${
                                            statusColors[incident.status as keyof typeof statusColors]
                                        }`}
                                    ></span>
                                    <span className="text-xs font-medium">{incident.status}</span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-current border-opacity-20">
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4" />
                                    {incident.location}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4" />
                                    {incident.date} at {incident.time}
                                </div>
                                <div>
                                    <span className="text-xs font-medium opacity-75">Severity: {incident.severity}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredIncidents.length === 0 && (
                    <div className="text-center py-12 rounded-lg bg-white dark:bg-[#0F2A1D] border border-[#AEC3B0]/40 dark:border-[#375534]/40">
                        <p className="text-[#6B8071] dark:text-[#AEC3B0]">
                            No {selectedTab} incidents at the moment.
                        </p>
                    </div>
                )}
            </div>
        </TouristLayout>
    );
}
