import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAcknowledgementById, acknowledgeAssignment } from '../../api/assets';
import StatusBadge from '../../components/StatusBadge';

function Field({ label, children }) {
  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-0.5 text-base text-zinc-200">{children}</p>
    </div>
  );
}

function statusOf(item) {
  if (item.acknowledged_at) return { text: 'Acknowledged', color: 'green' };
  if (!item.is_active) return { text: 'Returned unacknowledged', color: 'red' };
  return { text: 'Pending', color: 'amber' };
}

export default function AcknowledgementDetail() {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acking, setAcking] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setItem(await getAcknowledgementById(id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load acknowledgement');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAcknowledge() {
    setAcking(true);
    try {
      await acknowledgeAssignment(item.asset_id);
      toast.success('Receipt acknowledged');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to acknowledge receipt');
    } finally {
      setAcking(false);
    }
  }

  if (loading) return <p className="text-base text-zinc-500">Loading…</p>;
  if (!item) return <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error || 'Acknowledgement not found'}</p>;

  const status = statusOf(item);
  const needsAck = item.is_active && !item.acknowledged_at;

  return (
    <div className="max-w-2xl">
      <Link to="/employee/acknowledgements" className="mb-4 inline-block text-base font-medium text-zinc-500 hover:text-zinc-300">
        ← Back to acknowledgements
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-zinc-100">
            {item.name} <span className="text-xl font-normal text-zinc-500">({item.asset_tag})</span>
          </h1>
        </div>
        <StatusBadge text={status.text} color={status.color} />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>}

      <div className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        {item.category_name && <Field label="Category">{item.category_name}</Field>}

        <Field label="Condition">{item.condition}</Field>

        <Field label="Assigned">
          {new Date(item.assigned_at).toLocaleString()}
          {item.assigned_by_name && ` by ${item.assigned_by_name}`}
        </Field>

        <Field label="Your acknowledgement">
          {item.acknowledged_at
            ? `Confirmed on ${new Date(item.acknowledged_at).toLocaleString()}`
            : "You haven't acknowledged receipt of this yet"}
        </Field>

        {item.returned_at && (
          <Field label="Returned">{new Date(item.returned_at).toLocaleString()}</Field>
        )}

        <Field label="Asset details">
          <Link to={`/assets/${item.asset_id}`} className="font-medium text-emerald-400 hover:text-emerald-300">
            View full asset details →
          </Link>
        </Field>
      </div>

      {needsAck && (
        <button
          onClick={handleAcknowledge}
          disabled={acking}
          className="mt-6 rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {acking ? 'Acknowledging…' : 'Acknowledge receipt'}
        </button>
      )}
    </div>
  );
}
