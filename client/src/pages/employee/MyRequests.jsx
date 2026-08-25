import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyRequests } from '../../api/requests';
import StatusBadge from '../../components/StatusBadge';

const STATUS_COLORS = {
  pending: 'amber',
  approved: 'green',
  sent_for_repair: 'amber',
  rejected: 'red',
  completed: 'slate',
};

const TYPE_LABELS = {
  asset: 'New asset',
  return: 'Return',
  repair: 'Repair',
};

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setRequests(await getMyRequests());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 font-serif text-3xl font-bold tracking-tight text-zinc-100">My Requests</h1>
          <p className="text-base text-zinc-500">Click a request to see its full status and details.</p>
        </div>
        <Link
          to="/employee/requests/new"
          className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500"
        >
          + New request
        </Link>
      </div>

      {loading && <p className="text-base text-zinc-500">Loading…</p>}
      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>}

      {!loading && !error && (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-sm">
          {requests.map((r) => {
            const needsReturnAck = r.request_type === 'return' && r.status === 'completed' && !r.acknowledged_at;
            return (
              <li key={r.id}>
                <Link
                  to={`/employee/requests/${r.id}`}
                  className="flex items-center justify-between px-4 py-3.5 transition hover:bg-zinc-800/40"
                >
                  <div>
                    <p className="text-base font-medium text-zinc-100">
                      {TYPE_LABELS[r.request_type]}
                      {r.category_name && <span className="font-normal text-zinc-500"> · {r.category_name}</span>}
                      {r.asset_name && <span className="font-normal text-zinc-500"> · {r.asset_name}</span>}
                    </p>
                    <p className="mt-0.5 text-base text-zinc-500">{r.reason}</p>
                    <p className="mt-1 text-base text-zinc-600">
                      Submitted {new Date(r.created_at).toLocaleDateString()}
                      {r.reviewed_at && ` · Reviewed by ${r.reviewed_by_name || 'an administrator'} on ${new Date(r.reviewed_at).toLocaleDateString()}`}
                    </p>
                    {needsReturnAck && <p className="mt-1 text-base text-amber-400">Awaiting your acknowledgement</p>}
                  </div>
                  <StatusBadge text={r.status.replaceAll('_', ' ')} color={STATUS_COLORS[r.status]} />
                </Link>
              </li>
            );
          })}
          {requests.length === 0 && (
            <li className="px-4 py-6 text-center text-base text-zinc-500">You haven't submitted any requests yet.</li>
          )}
        </ul>
      )}
    </div>
  );
}
