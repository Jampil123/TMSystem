import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';

interface QRCode {
    id: number;
    token: string;
}

interface GuestListDetails {
    id: number;
    serviceName: string;
    visitDate: string;
    guestNames: string[];
}

interface Props {
    guestList: GuestListDetails;
    qrCodes: QRCode[];
}

// Wristband print page: horizontal colorful bands with QR on right
export default function PrintQRWristbands({ guestList, qrCodes }: Props) {
    const handlePrint = () => {
        window.print();
    };

    // Use a single cohesive green + white palette for all wristbands
    const singlePalette = {
        bg: 'linear-gradient(90deg, #ffffff 0%, #e6fff2 30%, #a7f3d0 100%)',
        text: '#05361f',
    };

    return (
        <>
            <Head title="Print Wristbands" />

            <div className="no-print fixed top-0 left-0 right-0 bg-white p-4 shadow z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={`/operator/guest-submission/${guestList.id}`} className="p-2 rounded hover:bg-gray-100">
                            <ArrowLeft className="w-5 h-5 text-gray-800" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Print Wristbands</h1>
                            <p className="text-sm text-gray-600">{guestList.serviceName} — {qrCodes.length} items</p>
                        </div>
                    </div>
                    <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded">
                        <Printer className="w-4 h-4 inline-block mr-2" /> Print
                    </button>
                </div>
            </div>

            <div className="pt-24 pb-8 print:pt-0 print:pb-0 bg-white">
                <div className="max-w-6xl mx-auto p-4">
                    {/* Each wristband is full-width block styled like the image */}
                    <div className="flex flex-col gap-4 items-center">
                        {qrCodes.map((qr, idx) => {
                            const guestName = guestList.guestNames[idx] || `Guest ${idx + 1}`;
                            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr.token)}`;

                            const palette = singlePalette;

                            return (
                                <div
                                    key={qr.id}
                                    className="w-full print:w-full" 
                                    style={{ pageBreakInside: 'avoid', width: '100%', maxWidth: '1000px' }}
                                >
                                    <div className="w-full" style={{ height: '72px' }}>
                                        <div className="h-full flex items-center" style={{ borderRadius: '6px', overflow: 'hidden' }}>
                                            {/* Left perf white area */}
                                            <div style={{ width: '40px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div style={{ width: '28px', height: '28px', background: '#fff', borderRight: '1px dashed rgba(0,0,0,0.12)' }} />
                                            </div>

                                            {/* Main colorful band */}
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: palette.bg }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <div style={{ fontSize: '20px', fontWeight: 800, color: palette.text, letterSpacing: '1px' }}>{guestList.serviceName.toUpperCase()}</div>
                                                        <div style={{ fontSize: '11px', color: palette.text, marginTop: '2px' }}>Wristband • {guestList.visitDate}</div>
                                                    </div>
                                                </div>

                                                {/* Right side QR and guest name */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ textAlign: 'right', color: palette.text, marginRight: '8px' }}>
                                                        <div style={{ fontSize: '13px', fontWeight: 700 }}>{guestName}</div>
                                                        <div style={{ fontSize: '10px' }}>Wristband Pass</div>
                                                    </div>
                                                    <div style={{ width: 64, height: 64, background: '#fff', padding: '6px' }}>
                                                        <img src={qrUrl} alt={`QR ${idx+1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right perf white area */}
                                            <div style={{ width: '40px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div style={{ width: '28px', height: '28px', background: '#fff', borderLeft: '1px dashed rgba(0,0,0,0.12)' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; }
                    @page { size: A4 landscape; margin: 6mm; }
                }
            `}</style>
        </>
    );
}
