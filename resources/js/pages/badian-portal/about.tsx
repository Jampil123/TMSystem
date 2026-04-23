import Header from '@/layouts/portal/Header';

// Theme Palette: #0F2A1D | #375534 | #6B9071 | #AEC3B0 | #E3EED4

export default function About() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            {/* Hero Banner */}
            <div
                className="relative flex items-center justify-center"
                style={{
                    backgroundImage: "url('/images/background.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '280px',
                }}
            >
                <div className="absolute inset-0" style={{ backgroundColor: 'rgba(15, 42, 29, 0.72)' }} />
                <div className="relative z-10 text-center px-6 py-14">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#6B9071' }}>
                        Discover
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#E3EED4' }}>
                        About Badian
                    </h1>
                    <p className="mt-3 text-sm" style={{ color: '#AEC3B0' }}>
                        A gem of southern Cebu, rich in nature and heritage
                    </p>
                </div>
            </div>

            {/* Slideshow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-6 z-20 w-full max-w-2xl flex justify-center">
                <div className="w-full rounded-2xl overflow-hidden shadow-lg border-4 border-[#6B9071] bg-[#E3EED4]">
                    <img
                        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                        alt="Badian Mock 1"
                        className="w-full h-56 object-cover object-center transition-all duration-700"
                    />
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1" style={{ backgroundColor: '#E3EED4' }}>
                <div className="max-w-5xl mx-auto px-6 py-14">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                        {/* Article */}
                        <div className="lg:col-span-2">
                            <div
                                className="rounded-2xl p-8"
                                style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}
                            >
                                {/* Section label */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div
                                        className="w-1 h-8 rounded-full"
                                        style={{ backgroundColor: '#6B9071' }}
                                    />
                                    <h2 className="text-xl font-bold" style={{ color: '#0F2A1D' }}>
                                        Overview
                                    </h2>
                                </div>

                                <p
                                    className="text-base leading-relaxed"
                                    style={{ color: '#375534' }}
                                >
                                    As often is the case in areas of great beauty around the world, Badian is now beginning to boom
                                    with development for nice tourist accommodations and resorts. With a number of tourist attractions
                                    in the area and many land owners putting their lands up for sale, there are some great locations
                                    available with great potential for the coming years.
                                </p>

                                {/* More details placeholder */}
                                <div
                                    className="mt-8 rounded-xl p-5 flex items-center gap-4"
                                    style={{ backgroundColor: '#E3EED4', border: '1px dashed #AEC3B0' }}
                                >
                                    <span className="text-2xl">📋</span>
                                    <p className="text-sm" style={{ color: '#6B9071' }}>
                                        More details coming soon. Check back for updates about Badian's history, culture, and more.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="flex flex-col gap-6">

                            {/* Quick Facts */}
                            <div
                                className="rounded-2xl p-6"
                                style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}
                            >
                                <h3 className="font-bold text-sm mb-4" style={{ color: '#0F2A1D' }}>
                                    Quick Facts
                                </h3>
                                <ul className="flex flex-col gap-3">
                                    {[
                                        { label: 'Province', value: 'Cebu' },
                                        { label: 'Region', value: 'Central Visayas' },
                                        { label: 'Country', value: 'Philippines' },
                                        { label: 'Known For', value: 'Kawasan Falls, Canyoneering' },
                                    ].map((fact) => (
                                        <li key={fact.label} className="flex justify-between text-sm">
                                            <span style={{ color: '#6B9071' }}>{fact.label}</span>
                                            <span className="font-semibold" style={{ color: '#0F2A1D' }}>{fact.value}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Highlights */}
                            <div
                                className="rounded-2xl p-6"
                                style={{ background: 'linear-gradient(135deg, #0F2A1D, #375534)', border: '1px solid #6B9071' }}
                            >
                                <h3 className="font-bold text-sm mb-4" style={{ color: '#E3EED4' }}>
                                    Highlights
                                </h3>
                                <ul className="flex flex-col gap-2">
                                    {[
                                        '💧 Kawasan Falls',
                                        '🏖️ Pristine Beaches',
                                        '🪂 Canyoneering',
                                        '⛪ Heritage Churches',
                                        '🤿 Coral Gardens',
                                    ].map((item) => (
                                        <li key={item} className="text-sm" style={{ color: '#AEC3B0' }}>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
