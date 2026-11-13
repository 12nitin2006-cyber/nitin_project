import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/axios';
import { formatDate } from '../constants';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

const STAT_CARDS = [
  { key: 'totalItems', label: 'Total items' },
  { key: 'lost', label: 'Lost' },
  { key: 'found', label: 'Found' },
  { key: 'claimed', label: 'Claimed' },
  { key: 'pendingClaims', label: 'Pending claims' },
];

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  const [status, setStatus] = useState('pending'); // claims filter
  const [loading, setLoading] = useState(true);

  const loadStats = () => api.get('/admin/stats').then((res) => setStats(res.data));

  // Reload the claims table when the status filter changes
  useEffect(() => {
    setLoading(true);
    Promise.all([api.get('/claims', { params: { status } }), loadStats()])
      .then(([claimsRes]) => setClaims(claimsRes.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [status]);

  const updateClaim = async (id, newStatus) => {
    try {
      await api.patch(`/claims/${id}`, { status: newStatus });
      toast.success(`Claim ${newStatus}`);
      // Approving can reject other claims too, so reload everything
      const res = await api.get('/claims', { params: { status } });
      setClaims(res.data);
      loadStats();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Admin panel</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STAT_CARDS.map(({ key, label }) => (
          <div key={key} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-indigo-600">{stats ? stats[key] : '–'}</p>
          </div>
        ))}
      </div>

      {/* Claims table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-4">
          <h2 className="font-semibold">Claims</h2>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </select>
        </div>

        {loading ? (
          <Spinner />
        ) : claims.length === 0 ? (
          <p className="py-10 text-center text-gray-500">No claims found</p>
        ) : (
          // overflow-x-auto lets the table scroll sideways on small phones
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Claimed by</th>
                  <th className="p-3">Proof</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {claims.map((claim) => (
                  <tr key={claim._id}>
                    <td className="p-3">
                      {claim.item ? (
                        <Link to={`/items/${claim.item._id}`} className="font-medium hover:text-indigo-600">
                          {claim.item.title}
                        </Link>
                      ) : (
                        <span className="text-gray-400">Deleted</span>
                      )}
                    </td>
                    <td className="p-3">
                      {claim.claimedBy?.name}
                      <div className="text-xs text-gray-400">{claim.claimedBy?.email}</div>
                    </td>
                    <td className="max-w-xs p-3 text-gray-600">{claim.proofMessage}</td>
                    <td className="p-3 whitespace-nowrap">{formatDate(claim.createdAt)}</td>
                    <td className="p-3"><Badge value={claim.status} /></td>
                    <td className="p-3">
                      {claim.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateClaim(claim._id, 'approved')}
                            className="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateClaim(claim._id, 'rejected')}
                            className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
