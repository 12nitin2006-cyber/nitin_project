import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { SERVER_URL, getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../constants';
import { ItemBadge } from '../components/Badge';
import Spinner from '../components/Spinner';
import { inputClass, buttonClass } from './Login';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proofMessage, setProofMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/items/${id}`)
      .then((res) => setItem(res.data))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!proofMessage.trim()) return toast.error('Please describe proof that it is yours');

    setSubmitting(true);
    try {
      await api.post('/claims', { itemId: id, proofMessage });
      toast.success('Claim sent! An admin will review it.');
      setProofMessage('');
      navigate('/my-posts');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/items/${id}`);
      toast.success('Item deleted');
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <Spinner />;
  if (!item) return <p className="py-12 text-center text-gray-500">Item not found</p>;

  const isOwner = user && item.postedBy?._id === user._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      {item.imageUrl ? (
        <img src={SERVER_URL + item.imageUrl} alt={item.title} className="w-full rounded-lg object-cover" />
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100 text-gray-400">No photo</div>
      )}

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-bold">{item.title}</h1>
          <ItemBadge item={item} />
        </div>
        <p className="whitespace-pre-line text-gray-700">{item.description}</p>

        <dl className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-white p-4 text-sm">
          <dt className="text-gray-500">Type</dt>
          <dd className="capitalize">{item.type}</dd>
          <dt className="text-gray-500">Category</dt>
          <dd>{item.category}</dd>
          <dt className="text-gray-500">Location</dt>
          <dd>{item.location}</dd>
          <dt className="text-gray-500">Date {item.type}</dt>
          <dd>{formatDate(item.date)}</dd>
          <dt className="text-gray-500">Posted by</dt>
          <dd>{item.postedBy?.name || 'Unknown'}</dd>
        </dl>

        {/* Owner / admin actions */}
        {(isOwner || isAdmin) && (
          <div className="flex gap-2">
            {isOwner && (
              <Link to={`/edit/${item._id}`} className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                Edit
              </Link>
            )}
            <button onClick={handleDelete} className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
              Delete
            </button>
          </div>
        )}

        {/* Claim form: only for logged-in users who do not own the item, while it is open */}
        {item.status === 'claimed' ? (
          <p className="rounded-md bg-gray-100 p-3 text-sm text-gray-600">This item has been claimed.</p>
        ) : !user ? (
          <p className="text-sm text-gray-600">
            <Link to="/login" className="text-indigo-600 hover:underline">Login</Link> to claim this item.
          </p>
        ) : (
          !isOwner && (
            <form onSubmit={handleClaim} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="font-semibold">
                {item.type === 'found' ? 'Claim this item' : 'I found this item'}
              </h2>
              <textarea
                rows={3}
                maxLength={500}
                value={proofMessage}
                onChange={(e) => setProofMessage(e.target.value)}
                placeholder={
                  item.type === 'found'
                    ? 'Proof it is yours, e.g. "black cover, sticker on back"'
                    : 'Where and when you found it'
                }
                className={inputClass}
              />
              <button disabled={submitting} className={buttonClass}>
                {submitting ? 'Sending...' : 'Send claim request'}
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
}
