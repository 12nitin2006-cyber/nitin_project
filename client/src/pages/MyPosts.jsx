import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/axios';
import { formatDate } from '../constants';
import Badge, { ItemBadge } from '../components/Badge';
import Spinner from '../components/Spinner';

export default function MyPosts() {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load my items and my claims at the same time
  useEffect(() => {
    Promise.all([api.get('/items/mine'), api.get('/claims/mine')])
      .then(([itemsRes, claimsRes]) => {
        setItems(itemsRes.data);
        setClaims(claimsRes.data);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/items/${id}`);
      setItems(items.filter((item) => item._id !== id)); // remove it from the list
      toast.success('Item deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      {/* ---------- My items ---------- */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">My posts</h1>
          <Link to="/post" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            + New post
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 py-8 text-center text-gray-500">
            You have not posted any items yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            {items.map((item) => (
              <li key={item._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link to={`/items/${item._id}`} className="font-medium hover:text-indigo-600">{item.title}</Link>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <ItemBadge item={item} /> {item.category} · {formatDate(item.date)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/edit/${item._id}`} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(item._id)} className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- My claims ---------- */}
      <section>
        <h2 className="mb-3 text-xl font-bold">My claims</h2>
        {claims.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 py-8 text-center text-gray-500">
            You have not claimed any items yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            {claims.map((claim) => (
              <li key={claim._id} className="flex items-start justify-between gap-3 p-4">
                <div>
                  {claim.item ? (
                    <Link to={`/items/${claim.item._id}`} className="font-medium hover:text-indigo-600">{claim.item.title}</Link>
                  ) : (
                    <span className="font-medium text-gray-400">Item deleted</span>
                  )}
                  <p className="mt-1 text-sm text-gray-500">“{claim.proofMessage}”</p>
                  <p className="text-xs text-gray-400">Sent {formatDate(claim.createdAt)}</p>
                </div>
                <Badge value={claim.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
