import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Check, X, AlertTriangle, Loader2, ChevronDown } from 'lucide-react';

interface Props {
    serviceId: number;
    currentStatus: string;
    onSuccess?: () => void;
    compact?: boolean; // For list/card views
}

export default function ServiceActionButton({ serviceId, currentStatus, onSuccess, compact = false }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [showRemarksModal, setShowRemarksModal] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'revision' | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    const handleAction = (type: 'approve' | 'reject' | 'revision') => {
        setActionType(type);
        if (type === 'approve') {
            submitAction(type, '');
        } else {
            setShowRemarksModal(true);
            setShowMenu(false);
        }
    };

    const submitAction = (type: string, remarksText: string = '') => {
        setIsLoading(true);
        
        const endpoints: Record<string, string> = {
            approve: `/services/${serviceId}/approve`,
            reject: `/services/${serviceId}/reject`,
            revision: `/services/${serviceId}/request-revision`,
        };

        router.post(
            endpoints[type],
            { remarks: remarksText },
            {
                onSuccess: () => {
                    setIsLoading(false);
                    setShowRemarksModal(false);
                    setRemarks('');
                    setActionType(null);
                    onSuccess?.();
                },
                onError: () => {
                    setIsLoading(false);
                    alert('An error occurred. Please try again.');
                },
            }
        );
    };

    // Determine available actions based on status
    const getAvailableActions = () => {
        switch (currentStatus) {
            case 'Pending':
                return ['approve', 'revision', 'reject'];
            case 'Revision Required':
                return ['approve', 'revision', 'reject'];
            case 'Approved':
                return ['revision', 'reject'];
            case 'Rejected':
                return ['approve'];
            default:
                return [];
        }
    };

    const availableActions = getAvailableActions();

    if (availableActions.length === 0) {
        return null;
    }

    // Compact version (for lists)
    if (compact) {
        return (
            <>
                <div className="relative inline-block">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#375534] hover:bg-[#2d4429] disabled:bg-[#375534]/50 text-white px-3 py-1 text-xs font-medium transition-colors"
                    >
                        Actions
                        <ChevronDown className="w-3 h-3" />
                    </button>
                    
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-40 rounded-lg bg-white dark:bg-[#375534] shadow-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 z-50 overflow-hidden">
                            {availableActions.includes('approve') && (
                                <button
                                    onClick={() => handleAction('approve')}
                                    disabled={isLoading}
                                    className="w-full text-left px-4 py-2 text-sm text-[#0F2A1D] dark:text-white hover:bg-green-100 dark:hover:bg-green-900/30 flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4 text-green-600" />
                                    Approve
                                </button>
                            )}
                            {availableActions.includes('revision') && (
                                <button
                                    onClick={() => handleAction('revision')}
                                    disabled={isLoading}
                                    className="w-full text-left px-4 py-2 text-sm text-[#0F2A1D] dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center gap-2"
                                >
                                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                                    Request Revision
                                </button>
                            )}
                            {availableActions.includes('reject') && (
                                <button
                                    onClick={() => handleAction('reject')}
                                    disabled={isLoading}
                                    className="w-full text-left px-4 py-2 text-sm text-[#0F2A1D] dark:text-white hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center gap-2"
                                >
                                    <X className="w-4 h-4 text-red-600" />
                                    Reject
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal for Remarks */}
                {showRemarksModal && (
                    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-[#375534] rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
                            <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-4">
                                {actionType === 'reject' ? 'Reject Service' : 'Request Revision'}
                            </h3>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-4">
                                {actionType === 'reject'
                                    ? 'Please provide a reason for rejecting this service.'
                                    : 'Please specify what revisions are needed.'}
                            </p>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder={
                                    actionType === 'reject'
                                        ? 'E.g., Overpricing compared to LGU standard rate'
                                        : 'E.g., Please reduce pricing to meet LGU standards'
                                }
                                className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-white px-3 py-2 text-sm placeholder-[#6B8071] dark:placeholder-[#AEC3B0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                            />
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRemarksModal(false);
                                        setRemarks('');
                                        setActionType(null);
                                    }}
                                    className="flex-1 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 px-4 py-2 text-sm font-medium text-[#0F2A1D] dark:text-white hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (!remarks.trim()) {
                                            alert('Please provide remarks.');
                                            return;
                                        }
                                        submitAction(actionType!, remarks);
                                    }}
                                    disabled={isLoading || !remarks.trim()}
                                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                                        actionType === 'reject'
                                            ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-600/50'
                                            : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50'
                                    }`}
                                >
                                    {isLoading ? 'Processing...' : 'Submit'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Full version (for detail pages)
    return (
        <>
            <div className="space-y-3">
                {availableActions.includes('approve') && (
                    <button
                        onClick={() => handleAction('approve')}
                        disabled={isLoading}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-medium py-2 px-4 transition-colors"
                    >
                        {isLoading && actionType === 'approve' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        {isLoading && actionType === 'approve' ? 'Approving...' : 'Approve Service'}
                    </button>
                )}

                {availableActions.includes('revision') && (
                    <button
                        onClick={() => handleAction('revision')}
                        disabled={isLoading}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-2 px-4 transition-colors"
                    >
                        {isLoading && actionType === 'revision' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <AlertTriangle className="w-4 h-4" />
                        )}
                        {isLoading && actionType === 'revision' ? 'Requesting...' : 'Request Revision'}
                    </button>
                )}

                {availableActions.includes('reject') && (
                    <button
                        onClick={() => handleAction('reject')}
                        disabled={isLoading}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-medium py-2 px-4 transition-colors"
                    >
                        {isLoading && actionType === 'reject' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <X className="w-4 h-4" />
                        )}
                        {isLoading && actionType === 'reject' ? 'Rejecting...' : 'Reject Service'}
                    </button>
                )}
            </div>

            {/* Modal for Remarks */}
            {showRemarksModal && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-[#375534] rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
                        <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-4">
                            {actionType === 'reject' ? 'Reject Service' : 'Request Revision'}
                        </h3>
                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-4">
                            {actionType === 'reject'
                                ? 'Please provide a reason for rejecting this service.'
                                : 'Please specify what revisions are needed.'}
                        </p>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder={
                                actionType === 'reject'
                                    ? 'E.g., Overpricing compared to LGU standard rate'
                                    : 'E.g., Please reduce pricing to meet LGU standards'
                            }
                            className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-white px-3 py-2 text-sm placeholder-[#6B8071] dark:placeholder-[#AEC3B0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                        />
                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRemarksModal(false);
                                    setRemarks('');
                                    setActionType(null);
                                }}
                                className="flex-1 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 px-4 py-2 text-sm font-medium text-[#0F2A1D] dark:text-white hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (!remarks.trim()) {
                                        alert('Please provide remarks.');
                                        return;
                                    }
                                    submitAction(actionType!, remarks);
                                }}
                                disabled={isLoading || !remarks.trim()}
                                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                                    actionType === 'reject'
                                        ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-600/50'
                                        : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50'
                                }`}
                            >
                                {isLoading ? 'Processing...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
