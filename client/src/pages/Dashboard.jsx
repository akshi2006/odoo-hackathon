import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await api('/api/trips');
        if (!cancelled) setTrips(data);
      } catch (err) {
        toast.error(err.message || 'Could not load trips');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-1 text-slate-600">Manage your trips and itineraries in one place.</p>
        </div>
        <Link
          to="/trips/new"
          className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 font-semibold text-white shadow hover:bg-accent-dark"
        >
          Plan New Trip
        </Link>
      </div>

      {loading ? (
        <Spinner className="py-24" />
      ) : trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-lg text-slate-600">You have no trips yet.</p>
          <p className="mt-2 text-slate-500">Click “Plan New Trip” to create your first itinerary.</p>
          <Link
            to="/trips/new"
            className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 font-semibold text-white"
          >
            Create a trip
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link
                to={`/trips/${trip.id}/itinerary`}
                className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <h2 className="text-lg font-semibold text-slate-900">{trip.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{trip.description || 'No description'}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                  {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
