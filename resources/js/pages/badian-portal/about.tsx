import MainLayout from '@/layouts/portal/MainLayouts';
import { useState, type ReactNode } from 'react';

export default function AboutPage() {
    const historySections = [
        {
            title: 'Why is the island named Badian?',
            paragraphs: [
                'This southern town got its name from a plant called, "badyang", which was once abundant in the area. However, the Spaniards found it difficult to pronounce the name so eventually the "g" was dropped and the "y" was changed to "i" and the town came to be known as Badian, a generally mountainous and hilly area where locals and tourists go around in jeepneys and tricycles.',
                'Badian was separated as a parish from Barili in 1825 under the advocacy of Santiago de Apostle. Its church is unique compared to the others in the island province with its squat and unusual porticoes facade with four quadrilateral columns supporting a triangular pediment. Simple floral bas reliefs decorate these and four jar shaped finials are found at each corner.',
                'The original belfry, now built at its side, used to sit atop the pediment but was taken down in 1990 upon the advice of NHI to ease pressure on the two free columns. The church still has its original and beautiful wooden retablo.',
            ],
        },
        {
            title: 'Geography and Climate in Badian',
            paragraphs: [
                "The Municipality of Badian is located 97.6 km southwest of Cebu City in the Central Visayas (Region VII). The mayor is the governor for Badian which has a total population of 35,876 according to the 2007 census and is a 4th class municipality in the province of Cebu, Philippines. The town is subdivided into 29 barangays and the capital barangay of Badian town is Poblacion. It has a total land area of 107 square kilometers and is bounded by the Municipality of Moalboal on the north; Municipality of Alegria on the south; Dalaguete and Argao on the east; and on the west by Tanon Strait. The topography of the Badian area is mountainous and hilly where dry seasons come on the months of February to September and the heaviest rains come on the month of October.",
            ],
        },
        {
            title: 'Schools in Badian',
            paragraphs: [
                'Badian has a total of 18 elementary schools and 3 high schools namely; Saint James Academy (a catholic school run by the Daughters of Saint Theresa), Badian National High School located at the center of the town and the extension located in Barangay Basak.',
            ],
        },
        {
            title: 'Roads and Transport in Badian',
            paragraphs: [
                'The transportation modes in the town are jeepneys, buses, tricycles, multi cabs, bicycle, and trisicads. Badian is connected with a network of roads with one main road traversing centrally. The minor roads that intersect will lead you to the 29 barangays or to any of the resorts, beaches in the town and to other point of interest.',
            ],
        },
        {
            title: 'Trading',
            paragraphs: [
                "The peso (code: PHP) is the currency of the Philippines and is the currency used in the town like the rest of the country. Financial and lending institution, cooperatives are the town's financial intermediaries and the commercial establishment includes restaurant, bakeshops, meat and fish retailer, sari-sari stores, general merchandise, service and repair shops, tailoring and dress shops, pawnshops and lending investment, lumber and hardware, drugstores, gasoline station, photo shops and parlors. Money remittances are also available in Badian from local pawn shops and money dealers.",
            ],
        },
        {
            title: 'Badian Fiesta',
            paragraphs: [
                'Badian\'s patron saint is Saint James the Apostle. The town\'s annual fiesta is every 24th and 25th of July every year. The colorful Banig Festival is held during the town fiesta which showcases the talent and creativity of the town in weaving mat using Pandan (Pandanus tectorius or Fragrant Screw Pine). The craftswomen collect Pandan leaves and use it to create "Banig", mat. Poblacion is where the town church is located, the church of Santiago Apostle, which celebrates its feast on the 25th of July every year.',
            ],
        },
    ];
    const [openSectionIndex, setOpenSectionIndex] = useState<number | null>(0);

    return (
        <div className="w-full" style={{ backgroundColor: 'rgb(227, 238, 212)' }}>
            <div className="max-w-7xl mx-auto px-6 py-8">
                

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main column */}
                    <div className="lg:col-span-9 space-y-6">
                        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}>
                            <img
                                src="/images/background.jpg"
                                alt="Badian beach"
                                className="w-full h-[340px] object-cover"
                            />
                        </div>

                        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}>
                            <h2 className="text-2xl font-bold mb-3" style={{ color: '#0F2A1D' }}>
                                Badian Under Development
                            </h2>
                            <p className="text-base leading-relaxed" style={{ color: '#375534' }}>
                                As often is the case in areas of great beauty around the world, Badian is now beginning
                                to boom with development for nice tourist accommodations and resorts. With a number of
                                tourist attractions in the area and many land owners putting their lands up for sale,
                                there are some great locations available with great potential for the coming years.
                            </p>
                        </div>

                        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}>
                            <h2 className="text-2xl font-bold mb-2" style={{ color: '#0F2A1D' }}>
                                A bit of Badian History
                            </h2>
                            <h3 className="text-lg font-semibold mb-4" style={{ color: '#375534' }}>
                                Some Facts About Badian
                            </h3>

                            <div className="space-y-3">
                                {historySections.map((section, index) => {
                                    const isOpen = openSectionIndex === index;

                                    return (
                                        <div
                                            key={section.title}
                                            className="rounded-xl border overflow-hidden"
                                            style={{ borderColor: '#AEC3B0' }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setOpenSectionIndex(isOpen ? null : index)}
                                                className="w-full px-4 py-3 flex items-center justify-between text-left"
                                                style={{ backgroundColor: '#eef5e3' }}
                                            >
                                                <span className="text-base font-semibold" style={{ color: '#0F2A1D' }}>
                                                    {section.title}
                                                </span>
                                                <span className="text-lg font-bold" style={{ color: '#375534' }}>
                                                    {isOpen ? '-' : '+'}
                                                </span>
                                            </button>

                                            {isOpen && (
                                                <div className="px-4 py-4 space-y-3" style={{ backgroundColor: '#fff' }}>
                                                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                                                        <p
                                                            key={`${section.title}-${paragraphIndex}`}
                                                            className="text-base leading-relaxed"
                                                            style={{ color: '#375534' }}
                                                        >
                                                            {paragraph}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Side column */}
                    <div className="lg:col-span-3">
                        <div
                            className="rounded-2xl p-6 shadow-sm h-full"
                            style={{
                                background: 'linear-gradient(180deg, #5f7766 0%, #436c43 100%)',
                                border: '1px solid rgba(227, 238, 212, 0.35)',
                            }}
                        >
                            <h3 className="text-3xl font-bold mb-6" style={{ color: '#E3EED4' }}>
                                About Badian
                            </h3>

                            <div className="space-y-5">
                                <div>
                                    <p className="text-xl font-semibold" style={{ color: '#E3EED4' }}>Location</p>
                                    <p className="mt-1.5 text-base leading-relaxed" style={{ color: '#cbd8c3' }}>
                                        Southern Municipality of Cebu, Philippines
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xl font-semibold" style={{ color: '#E3EED4' }}>Population</p>
                                    <p className="mt-1.5 text-base leading-relaxed" style={{ color: '#cbd8c3' }}>
                                        Approximately 15,000+ residents
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xl font-semibold" style={{ color: '#E3EED4' }}>Area</p>
                                    <p className="mt-1.5 text-base leading-relaxed" style={{ color: '#cbd8c3' }}>
                                        Approximately 94.19 square kilometers
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xl font-semibold" style={{ color: '#E3EED4' }}>Known For</p>
                                    <p className="mt-1.5 text-base leading-relaxed" style={{ color: '#cbd8c3' }}>
                                        Pristine beaches, marine biodiversity, and cultural heritage
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xl font-semibold" style={{ color: '#E3EED4' }}>Best Season</p>
                                    <p className="mt-1.5 text-base leading-relaxed" style={{ color: '#cbd8c3' }}>
                                        November to May (Dry Season)
                                    </p>
                                </div>
                            </div>

                            <div className="my-7 h-px" style={{ backgroundColor: 'rgba(227, 238, 212, 0.25)' }} />

                            <p className="text-base italic leading-relaxed" style={{ color: '#d9e5d3' }}>
                                "Discover paradise in the heart of Cebu. Experience authentic Filipino hospitality and
                                natural beauty."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

AboutPage.layout = (page: ReactNode) => <MainLayout children={page} />;
