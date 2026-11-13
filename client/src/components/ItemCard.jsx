import { Link } from 'react-router-dom';
import { SERVER_URL } from '../api/axios';
import { formatDate } from '../constants';
import { ItemBadge } from './Badge';

// One item in the grid on the home page
export default function ItemCard({ item }) {
  return (
    <Link
      to={`/items/${item._id}`}
      className="block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      {item.imageUrl ? (
        <img src={SERVER_URL + item.imageUrl} alt={item.title} className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 items-center justify-center bg-gray-100 text-sm text-gray-400">No photo</div>
      )}

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold">{item.title}</h3>
          <ItemBadge item={item} />
        </div>
        <p className="text-sm text-gray-500">{item.category}</p>
        <p className="line-clamp-1 text-sm text-gray-600">📍 {item.location}</p>
        <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
      </div>
    </Link>
  );
}
