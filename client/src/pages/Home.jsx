import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/axios';
import FilterBar from '../components/FilterBar';
import ItemCard from '../components/ItemCard';
import Spinner from '../components/Spinner';

export default function Home() {
  const [filters, setFilters] = useState({ search: '', type: '', category: '', location: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Fetch items whenever the filters or page change.
  // The 400 ms delay ("debounce") avoids calling the API on every key press.
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get('/items', { params: { ...filters, page } }) // the server ignores empty filters
        .then((res) => setData(res.data))
        .catch((err) => toast.error(getErrorMessage(err)))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timer); // cancel if the user keeps typing
  }, [filters, page]);

  // New filters should start again from page 1
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lost something? Found something?</h1>
        <p className="text-gray-500">Browse items reported around campus.</p>
      </div>

      <FilterBar filters={filters} onChange={handleFilterChange} />

      {loading ? (
        <Spinner />
      ) : data.items.length === 0 ? (
        <p className="py-12 text-center text-gray-500">No items found</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {data.totalPages}
          </span>
          <button
            disabled={page === data.totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
