import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllRequests } from '../../api/requests';
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

const STATUS_FILTERS = ['pending', 'approved', 'sent_for_repair', 'rejected', 'completed', 'all'];

// A short hint for the admin about what a card in "approved" / "sent_for_repair" is actually waiting on.
function waitingCaption(r) {
  if (r.status === 'approved' && r.request_type === 'asset') return 'Awaiting asset assignment';
  if (r.status === 'approved' && r.request_type === 'return') return 'Awaiting return — mark completed once received';
  if (r.status === 'sent_for_repair') return 'Under repair — awaiting completion';
  if (r.status === 'completed' && r.request_type === 'return' && !r.acknowledged_at) return 'Awaiting employee acknowledgement';
  return null;
}

export default function RequestQueue() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setRequests(await getAllRequests({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search.trim() || undefined,
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  return (
    <div>
      <h1 className="mb-1 font-serif text-3xl tracking-tight text-zinc-100">Requests</h1>
      <p className="mb-6 text-base text-zinc-500">Click a request to review, approve, reject, and fulfill it.</p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by employee, asset, category, or reason…"
        className="mb-3 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
              statusFilter === s
                ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/25'
                : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'
            }`}
          >
            {s.replaceAll('_', ' ')}
          </button>
        ))}
      </div>

      {loading && <p className="text-base text-zinc-500">Loading…</p>}
      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>}

      {!loading && !error && (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-sm">
          {requests.map((r) => (
            <li key={r.id}>
              <Link
                to={`/admin/requests/${r.id}`}
                className="flex items-center justify-between px-4 py-3.5 transition hover:bg-zinc-800/40"
              >
                <div>
                  <p className="text-base font-medium text-zinc-100">
                    {r.employee_name} <span className="font-normal text-zinc-500">— {TYPE_LABELS[r.request_type]}</span>
                    {r.category_name && <span className="font-normal text-zinc-500"> · {r.category_name}</span>}
                    {r.asset_name && <span className="font-normal text-zinc-500"> · {r.asset_name} ({r.asset_tag})</span>}
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-500">{r.reason}</p>
                  <p className="mt-1 text-sm text-zinc-600">Submitted {new Date(r.created_at).toLocaleDateString()}</p>
                  {waitingCaption(r) && <p className="mt-1 text-sm text-amber-400">{waitingCaption(r)}</p>}
                </div>

                <StatusBadge text={r.status.replaceAll('_', ' ')} color={STATUS_COLORS[r.status]} />
              </Link>
            </li>
          ))}
          {requests.length === 0 && (
            <li className="px-4 py-6 text-center text-base text-zinc-500">No requests here.</li>
          )}
        </ul>
      )}
    </div>
  );
}
