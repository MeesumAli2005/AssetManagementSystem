import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyAcknowledgements, acknowledgeAssignment } from '../../api/assets';
import { getMyRequests, acknowledgeReturn } from '../../api/requests';
import StatusBadge from '../../components/StatusBadge';

export default function Acknowledgements() {
  const [assignments, setAssignments] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ackingId, setAckingId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [assignmentAcks, myRequests] = await Promise.all([
        getMyAcknowledgements(),
        getMyRequests(),
      ]);
      setAssignments(assignmentAcks);
      setReturns(myRequests.filter((r) => r.request_type === 'return' && r.status === 'completed'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load acknowledgements');
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

  async function handleAcknowledgeReturn(request) {
    setAckingId(`return-${request.id}`);
    try {
      await acknowledgeReturn(request.id);
      toast.success('Return acknowledged');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to acknowledge return');
    } finally {
      setAckingId(null);
    }
  }

  // A single, date-sorted history of every acknowledgement (assignment
  // receipts and return confirmations alike) — acted-on ones and still-
  // pending ones together, most recent first. Click one to see its details.
  const combined = [
    ...assignments.map((a) => ({ kind: 'assignment', date: new Date(a.assigned_at), data: a })),
    ...returns.map((r) => ({ kind: 'return', date: new Date(r.reviewed_at || r.created_at), data: r })),
  ].sort((a, b) => b.date - a.date);

  return (
    <div>
      <h1 className="mb-1 font-serif text-3xl font-bold tracking-tight text-zinc-100">Acknowledgements</h1>
      <p className="mb-6 text-base text-zinc-500">
        Every asset receipt and return you've acknowledged, or still need to. Click one to see its full details.
      </p>

      {loading && <p className="text-base text-zinc-500">Loading…</p>}
      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>}

      {!loading && !error && (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-sm">
          {combined.map(({ kind, data }) => {
            if (kind === 'assignment') {
              const pending = data.is_active && !data.acknowledged_at;
              return (
                <li key={`assignment-${data.assignment_id}`}>
                  <Link
                    to={`/employee/acknowledgements/${data.assignment_id}`}
                    className="flex items-center justify-between px-4 py-3.5 transition hover:bg-zinc-800/40"
                  >
                    <div>
                      <p className="text-base font-medium text-zinc-100">
                        {data.name}
                      </p>
                      <p className="text-base text-zinc-500">
                        {data.category_name || '—'} · Assigned by {data.assigned_by_name || 'an administrator'} on{' '}
                        {new Date(data.assigned_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {pending ? (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAcknowledge(data); }}
                          disabled={ackingId === data.assignment_id}
                          className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {ackingId === data.assignment_id ? 'Acknowledging…' : 'Acknowledge'}
                        </button>
                      ) : (
                        <StatusBadge text={data.acknowledged_at ? 'Acknowledged' : 'Returned unacknowledged'} color={data.acknowledged_at ? 'green' : 'red'} />
                      )}
                    </div>
                  </Link>
                </li>
              );
            }

            const request = data;
            const pending = !request.acknowledged_at;
            return (
              <li key={`return-${request.id}`}>
                <Link
                  to={`/employee/requests/${request.id}`}
                  className="flex items-center justify-between px-4 py-3.5 transition hover:bg-zinc-800/40"
                >
                  <div>
                    <p className="text-base font-medium text-zinc-100">
                      {request.asset_name}
                    </p>
                    <p className="text-base text-zinc-500">Return marked complete</p>
                  </div>
                  {pending ? (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAcknowledgeReturn(request); }}
                      disabled={ackingId === `return-${request.id}`}
                      className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {ackingId === `return-${request.id}` ? 'Acknowledging…' : 'Acknowledge'}
                    </button>
                  ) : (
                    <StatusBadge text="Acknowledged" color="green" />
                  )}
                </Link>
              </li>
            );
          })}

          {combined.length === 0 && (
            <li className="px-4 py-6 text-center text-base text-zinc-500">Nothing here yet.</li>
          )}
        </ul>
      )}
    </div>
  );
}
