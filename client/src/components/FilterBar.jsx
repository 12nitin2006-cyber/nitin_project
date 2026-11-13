import { CATEGORIES } from '../constants';

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none';

// Search box + filters. The parent (Home) owns the `filters` state.
export default function FilterBar({ filters, onChange }) {
  // Update one field and keep the others
  const update = (e) => onChange({ ...filters, [e.target.name]: e.target.value });

  return (
    <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
      <input
        name="search"
        value={filters.search}
        onChange={update}
        placeholder="Search title or description..."
        className={`${inputClass} sm:col-span-2 lg:col-span-1`}
      />

      <select name="type" value={filters.type} onChange={update} className={inputClass}>
        <option value="">All types</option>
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </select>

      <select name="category" value={filters.category} onChange={update} className={inputClass}>
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <input
        name="location"
        value={filters.location}
        onChange={update}
        placeholder="Location (e.g. canteen)"
        className={inputClass}
      />
    </div>
  );
}
