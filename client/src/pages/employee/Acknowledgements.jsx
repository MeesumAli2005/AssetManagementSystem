import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPendingAcknowledgements, acknowledgeAssignment } from '../../api/assets';

export default function Acknowledgements() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ackingId, setAckingId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setPending(await getPendingAcknowledgements());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending acknowledgements');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAcknowledge(item) {
    setAckingId(item.assignment_id);
    try {
      await acknowledgeAssignment(item.asset_id);
      toast.success(`Acknowledged receipt of "${item.name}"`);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to acknowledge');
    } finally {
      setAckingId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-1 font-serif text-3xl tracking-tight text-zinc-100">Acknowledgements</h1>
      <p className="mb-6 text-base text-zinc-500">Confirm receipt of assets newly assigned to you. Click one to see its full details.</p>

      {loading && <p className="text-base text-zinc-500">Loading…</p>}
      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>}

      {!loading && !error && (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-sm">
          {pending.map((item) => (
            <li key={item.assignment_id}>
              <Link
                to={`/assets/${item.asset_id}`}
                className="flex items-center justify-between px-4 py-3.5 transition hover:bg-zinc-800/40"
              >
                <div>
                  <p className="text-base font-medium text-zinc-100">
                    {item.name} <span className="font-normal text-zinc-500">({item.asset_tag})</span>
                  </p>
                  <p className="text-base text-zinc-500">
                    {item.category_name || '—'} · Assigned by {item.assigned_by_name || 'an administrator'} on{' '}
                    {new Date(item.assigned_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAcknowledge(item); }}
                  disabled={ackingId === item.assignment_id}
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ackingId === item.assignment_id ? 'Acknowledging…' : 'Acknowledge receipt'}
                </button>
              </Link>
            </li>
          ))}
          {pending.length === 0 && (
            <li className="px-4 py-6 text-center text-base text-zinc-500">Nothing pending, you're all caught up.</li>
          )}
        </ul>
      )}
    </div>
  );
}
