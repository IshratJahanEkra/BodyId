import { useState, useEffect } from 'react';
import { X, Search, UserPlus, Trash2, User } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SharedWithModal({ record, onClose }) {
    const [bmdcId, setBmdcId] = useState('');
    const [loading, setLoading] = useState(false);
    const [sharedUsers, setSharedUsers] = useState(record.sharedWith || []);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const fetchRecordDetails = async () => {
            // Check if sharedWith is likely just IDs (strings) or unpopulated objects
            const needsFetch = !record.sharedWith || (record.sharedWith.length > 0 && typeof record.sharedWith[0] === 'string');

            if (needsFetch || record.sharedWith) { // Always fetch to be safe and get latest state
                try {
                    const res = await api.get(`/records/${record._id}`);
                    if (res.data.record && res.data.record.sharedWith) {
                        setSharedUsers(res.data.record.sharedWith);
                    }
                } catch (error) {
                    console.error("Failed to fetch record details", error);
                }
            } else {
                setSharedUsers(record.sharedWith || []);
            }
        };

        fetchRecordDetails();
    }, [record._id]);

    const handleShare = async (e) => {
        e.preventDefault();
        if (!bmdcId.trim()) return;

        setLoading(true);
        try {
            const res = await api.post(`/records/${record._id}/share`, {
                doctorBmdcId: bmdcId,
            });
            setSharedUsers(res.data.sharedWith);
            setBmdcId('');
            toast.success('Record shared successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to share record');
        } finally {
            setLoading(false);
        }
    };

    const handleUnshare = async (doctorBmdcId) => {
        if (!confirm('Are you sure you want to revoke access?')) return;

        try {
            const res = await api.delete(`/records/${record._id}/share/${doctorBmdcId}`);
            setSharedUsers(res.data.sharedWith);
            toast.success('Access revoked');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to revoke access');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Share Record</h3>
                        <p className="text-xs text-gray-500 truncate max-w-[250px]">
                            {record.title || 'Untitled Record'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">

                    {/* Add Doctor Form */}
                    <form onSubmit={handleShare} className="mb-8">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Add Doctor by BMDC ID
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={bmdcId}
                                    onChange={(e) => setBmdcId(e.target.value)}
                                    placeholder="Enter Doctor's BMDC ID"
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm font-medium whitespace-nowrap"
                            >
                                {loading ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Only doctors with a valid BMDC ID can be added.
                        </p>
                    </form>

                    {/* Shared List */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            People with access
                        </h4>

                        {sharedUsers && sharedUsers.length > 0 ? (
                            <div className="space-y-3">
                                {sharedUsers.map((user) => (
                                    <div key={user._id || user} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                                                {(user.name?.[0] || 'D').toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{user.name || 'Doctor'}</p>
                                                <p className="text-xs text-gray-500">{user.bmdcId || 'BMDC ID: ...'}</p>
                                            </div>
                                        </div>
                                        {user.bmdcId && (
                                            <button
                                                onClick={() => handleUnshare(user.bmdcId)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                title="Revoke access"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <UserPlus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Not shared with anyone yet</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
