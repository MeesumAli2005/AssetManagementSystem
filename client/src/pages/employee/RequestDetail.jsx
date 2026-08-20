import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getRequestById, acknowledgeReturn } from '../../api/requests';
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

function Field({ label, children }) {
  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-0.5 text-base text-zinc-200">{children}</p>
    </div>
  );
}

export default function RequestDetail() {
  const { id } = useParams();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acking, setAcking] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setRequest(await getRequestById(id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load request');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAcknowledgeReturn() {
    setAcking(true);
    try {
      await acknowledgeReturn(request.id);
      toast.success('Return acknowledged');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to acknowledge return');
    } finally {
      setAcking(false);
    }
  }

  if (loading) return <p className="text-base text-zinc-500">Loading…</p>;
  if (!request) return <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error || 'Request not found'}</p>;

  const needsReturnAck = request.request_type === 'return' && request.status === 'completed' && !request.acknowledged_at;

  return (
    <div className="max-w-2xl">
      <Link to="/employee/requests" className="mb-4 inline-block text-base font-medium text-zinc-500 hover:text-zinc-300">
        ← Back to my requests
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-zinc-100">
            {TYPE_LABELS[request.request_type]} request
          </h1>
        </div>
        <StatusBadge text={request.status.replaceAll('_', ' ')} color={STATUS_COLORS[request.status]} />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>}

      <div className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <Field label="Reason">{request.reason}</Field>

        {request.category_name && <Field label="Category">{request.category_name}</Field>}

        {request.asset_name && (
          <Field label="Asset">{request.asset_name} ({request.asset_tag})</Field>
        )}

        {request.resulting_asset_name && (
          <Field label="Fulfilled with">{request.resulting_asset_name} ({request.resulting_asset_tag})</Field>
        )}

        <Field label="Submitted">{new Date(request.created_at).toLocaleString()}</Field>

        {request.reviewed_at && (
          <Field label="Reviewed">{request.reviewed_by_name || 'An administrator'} on {new Date(request.reviewed_at).toLocaleString()}</Field>
        )}

        {request.review_notes && <Field label="Note from administrator">{request.review_notes}</Field>}

        {request.completion_notes && (
          <Field label={request.request_type === 'repair' ? 'Repair completion notes' : 'Completion notes'}>
            {request.completion_notes}
          </Field>
        )}

        {request.request_type === 'return' && request.status === 'completed' && (
          <Field label="Your acknowledgement">
            {request.acknowledged_at
              ? `Confirmed on ${new Date(request.acknowledged_at).toLocaleString()}`
              : "You haven't confirmed you sent the asset back yet"}
          </Field>
        )}
      </div>

      {needsReturnAck && (
        <button
          onClick={handleAcknowledgeReturn}
          disabled={acking}
          className="mt-6 rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {acking ? 'Acknowledging…' : "Acknowledge I've sent it back"}
        </button>
      )}
    </div>
  );
}
