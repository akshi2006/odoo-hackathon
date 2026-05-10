import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api.js';
import Spinner from '../components/Spinner.jsx';
import TripSubNav from '../components/TripSubNav.jsx';
import { useTrip } from '../hooks/useTrip.js';

const DEFAULT_CATEGORIES = ['clothing', 'toiletries', 'electronics', 'documents', 'general'];

export default function PackingPage() {
  const { id } = useParams();
  const tripId = Number(id);
  const { trip, loading: tripLoading } = useTrip(tripId);
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('general');
  const [errors, setErrors] = useState({});
  const [adding, setAdding] = useState(false);

  async function loadPacking() {
    setListLoading(true);
    try {
      const data = await api(`/api/trips/${tripId}/packing`);
      setItems(data);
    } catch (err) {
      toast.error(err.message || 'Could not load packing list');
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    if (tripId) loadPacking();
  }, [tripId]);

  function validate() {
    const e = {};
    if (!name.trim()) e.name = 'Item name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function addItem(e) {
    e.preventDefault();
    if (!validate()) return;
    setAdding(true);
    try {
      await api(`/api/trips/${tripId}/packing`, {
        method: 'POST',
        body: { name: name.trim(), category },
      });
      toast.success('Item added');
      setName('');
      setCategory('general');
      loadPacking();
    } catch (err) {
      toast.error(err.message || 'Could not add item');
    } finally {
      setAdding(false);
    }
  }

  async function toggleItem(itemId) {
    try {
      const updated = await api(`/api/packing/${itemId}/toggle`, { method: 'PATCH' });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      toast.error(err.message || 'Could not update item');
    }
  }

  const grouped = items.reduce((acc, item) => {
    const c = item.category || 'general';
    if (!acc[c]) acc[c] = [];
    acc[c].push(item);
    return acc;
  }, {});

  if (tripLoading) {
    return (
      <div>
        <TripSubNav />
        <Spinner className="py-20" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div>
        <Link to="/dashboard" className="text-sm font-medium text-primary hover:underline">
          ← Dashboard
        </Link>
        <p className="mt-6 text-slate-600">We could not find that trip.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2">
        <Link to="/dashboard" className="text-sm font-medium text-primary hover:underline">
          ← Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Packing · {trip.name}</h1>
      <p className="mt-1 text-slate-600">Organize and check off items before you go.</p>

      <TripSubNav />

      <form
        onSubmit={addItem}
        className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="item-name" className="mb-1 block text-sm font-medium text-slate-700">
            Item
          </label>
          <input
            id="item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        <div className="w-full sm:w-48">
          <label htmlFor="item-cat" className="mb-1 block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            id="item-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary"
          >
            {DEFAULT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={adding}
          className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {adding ? 'Adding…' : 'Add item'}
        </button>
      </form>

      {listLoading ? (
        <Spinner className="py-12" />
      ) : items.length === 0 ? (
        <p className="text-slate-500">No items yet. Add your first packing item above.</p>
      ) : (
        <div className="space-y-8">
          {Object.keys(grouped)
            .sort()
            .map((cat) => (
              <div key={cat}>
                <h2 className="mb-3 capitalize text-sm font-semibold tracking-wide text-primary">
                  {cat}
                </h2>
                <ul className="space-y-2">
                  {grouped[cat].map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 ${
                          item.is_packed
                            ? 'border-primary bg-primary text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                        aria-pressed={item.is_packed}
                        aria-label={item.is_packed ? 'Mark unpacked' : 'Mark packed'}
                      >
                        {item.is_packed ? '✓' : ''}
                      </button>
                      <span
                        className={
                          item.is_packed ? 'text-slate-400 line-through' : 'font-medium text-slate-900'
                        }
                      >
                        {item.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
