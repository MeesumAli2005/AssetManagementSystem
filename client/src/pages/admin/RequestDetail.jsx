import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getRequestById,
  reviewRequest,
  assignAssetToRequest,
  completeReturn,
  completeRepair,
  addRequestNote,
} from '../../api/requests';
import { getAllAssets } from '../../api/assets';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

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

const COMPLETION_LABELS = {
  asset: 'Asset assigned',
  return: 'Return completed',
  repair: 'Repair completed',
};

// Derives the request's lifecycle timeline from the timestamp/actor fields
// already on the row — no separate audit table, just presenting what's
// there in order.
function buildTimeline(r) {
  const steps = [{ label: 'Submitted', at: r.created_at, by: r.employee_name }];

  if (r.reviewed_at) {
    const label = r.status === 'rejected'
      ? 'Rejected'
      : r.request_type === 'repair'
        ? 'Approved — sent for repair'
        : 'Approved';
    steps.push({ label, at: r.reviewed_at, by: r.reviewed_by_name });
  }

  if (r.completed_at) {
    steps.push({ label: COMPLETION_LABELS[r.request_type], at: r.completed_at, by: r.completed_by_name });
  }

  if (r.request_type === 'return' && r.acknowledged_at) {
    steps.push({ label: 'Acknowledged by employee', at: r.acknowledged_at, by: r.employee_name });
  }

  return steps;
}

function waitingCaption(r) {
  if (r.status === 'approved' && r.request_type === 'asset') return 'Awaiting asset assignment';
  if (r.status === 'approved' && r.request_type === 'return') return 'Awaiting return — mark completed once received';
  if (r.status === 'sent_for_repair') return 'Under repair — awaiting completion';
  if (r.status === 'completed' && r.request_type === 'return' && !r.acknowledged_at) return 'Awaiting employee acknowledgement';
  return null;
}

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
  const [acting, setActing] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [chosenAssetId, setChosenAssetId] = useState('');

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState(null); // 'approved' | 'rejected'
  const [reviewNotes, setReviewNotes] = useState('');
  const [repairDetails, setRepairDetails] = useState('');

  const [returnCompleteOpen, setReturnCompleteOpen] = useState(false);
  const [returnNotes, setReturnNotes] = useState('');

  const [repairCompleteOpen, setRepairCompleteOpen] = useState(false);
  const [repairNotes, setRepairNotes] = useState('');

  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

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

  function openReview(action) {
    setReviewAction(action);
    setReviewNotes('');
    setRepairDetails('');
    setReviewOpen(true);
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    setActing(true);
    try {
      const extra = { review_notes: reviewNotes || undefined };
      if (reviewAction === 'approved' && request.request_type === 'repair') {
        extra.repair_details = repairDetails || undefined;
      }
      const result = await reviewRequest(request.id, reviewAction, extra);
      toast.success(result.message);
      setReviewOpen(false);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${reviewAction === 'approved' ? 'approve' : 'reject'} request`);
    } finally {
      setActing(false);
    }
  }

  async function openAssignModal() {
    setChosenAssetId('');
    setAvailableAssets([]);
    setAssignOpen(true);
    try {
      const result = await getAllAssets({ category_id: request.category_id, status: 'available', limit: 100 });
      setAvailableAssets(result.data);
    } catch (err) {
      toast.error('Failed to load available assets');
    }
  }

  async function handleAssign(e) {
    e.preventDefault();
    setActing(true);
    try {
      const result = await assignAssetToRequest(request.id, Number(chosenAssetId));
      toast.success(result.message);
      setAssignOpen(false);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign asset');
    } finally {
      setActing(false);
    }
  }

  async function handleCompleteReturn(e) {
    e.preventDefault();
    setActing(true);
    try {
      const result = await completeReturn(request.id, returnNotes || undefined);
      toast.success(result.message);
      setReturnCompleteOpen(false);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete return');
    } finally {
      setActing(false);
    }
  }

  async function handleCompleteRepair(e) {
    e.preventDefault();
    setActing(true);
    try {
      const result = await completeRepair(request.id, repairNotes || undefined);
      toast.success(result.message);
      setRepairCompleteOpen(false);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete repair');
    } finally {
      setActing(false);
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      await addRequestNote(request.id, noteText.trim());
      setNoteText('');
      toast.success('Note added');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  }

  if (loading) return <p className="text-base text-zinc-500">Loading…</p>;
  if (!request) return <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error || 'Request not found'}</p>;

  return (
    <div className="max-w-2xl">
      <Link to="/admin/requests" className="mb-4 inline-block text-sm font-medium text-zinc-500 hover:text-zinc-300">
        ← Back to requests
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-zinc-100">
            {TYPE_LABELS[request.request_type]} request
          </h1>
          <p className="text-base text-zinc-500">{request.employee_name} · {request.employee_email}</p>
        </div>
        <StatusBadge text={request.status.replaceAll('_', ' ')} color={STATUS_COLORS[request.status]} />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>}
      {waitingCaption(request) && (
        <p className="mb-4 rounded-lg bg-amber-500/10 px-3 py-2 text-base text-amber-400">{waitingCaption(request)}</p>
      )}

      <div className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <Field label="Reason">{request.reason}</Field>

        {request.category_name && <Field label="Category">{request.category_name}</Field>}

        {request.asset_name && (
          <Field label="Asset">
            {request.asset_name} — currently {request.asset_status?.replaceAll('_', ' ')}
          </Field>
        )}

        {request.resulting_asset_name && (
          <Field label="Fulfilled with">{request.resulting_asset_name}</Field>
        )}

        <Field label="Submitted">{new Date(request.created_at).toLocaleString()}</Field>

        {request.reviewed_at && (
          <Field label="Reviewed">{request.reviewed_by_name} on {new Date(request.reviewed_at).toLocaleString()}</Field>
        )}

        {request.review_notes && <Field label="Note to employee">{request.review_notes}</Field>}

        {request.repair_details && <Field label="Internal repair notes (private — not shown to employee)">{request.repair_details}</Field>}

        {request.completion_notes && (
          <Field label={request.request_type === 'repair' ? 'Repair completion notes' : 'Completion notes'}>
            {request.completion_notes}
          </Field>
        )}

        {request.request_type === 'return' && request.status === 'completed' && (
          <Field label="Employee acknowledgement">
            {request.acknowledged_at
              ? `Confirmed on ${new Date(request.acknowledged_at).toLocaleString()}`
              : 'Waiting for the employee to confirm they sent the asset back'}
          </Field>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <p className="mb-3 text-base font-medium text-zinc-300">Lifecycle</p>
        <ul className="space-y-3 border-l border-zinc-800 pl-4">
          {buildTimeline(request).map((step, i) => (
            <li key={i} className="text-base">
              <p className="text-zinc-200">{step.label}</p>
              <p className="text-sm text-zinc-500">
                {new Date(step.at).toLocaleString()}{step.by && ` · ${step.by}`}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {request.status === 'pending' && (
          <>
            <button
              onClick={() => openReview('approved')}
              disabled={acting}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => openReview('rejected')}
              disabled={acting}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-base font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reject
            </button>
          </>
        )}

        {request.status === 'approved' && request.request_type === 'asset' && (
          <button
            onClick={openAssignModal}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500"
          >
            Assign asset
          </button>
        )}

        {request.status === 'approved' && request.request_type === 'return' && (
          <button
            onClick={() => { setReturnNotes(''); setReturnCompleteOpen(true); }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500"
          >
            Mark completed
          </button>
        )}

        {request.status === 'sent_for_repair' && (
          <button
            onClick={() => { setRepairNotes(''); setRepairCompleteOpen(true); }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500"
          >
            Mark repaired &amp; returned
          </button>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-zinc-200">Internal notes</h2>
        <p className="mb-3 text-sm text-zinc-500">
          Private Note, never shown to the employee. Can be added at any point, regardless of status.
        </p>

        <form onSubmit={handleAddNote} className="mb-4 flex gap-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={2}
            placeholder="Add a note…"
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          <button
            type="submit"
            disabled={addingNote || !noteText.trim()}
            className="self-start rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {addingNote ? 'Adding…' : 'Add note'}
          </button>
        </form>

        {request.notes && request.notes.length > 0 ? (
          <ul className="space-y-3">
            {request.notes.map((n) => (
              <li key={n.id} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-base text-zinc-200">{n.note}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {n.admin_name} on {new Date(n.created_at).toLocaleString()} — request was{' "'}
                  <span className="capitalize">{n.status_at_time.replaceAll('_', ' ')}</span> " at the time
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base text-zinc-500">No notes yet.</p>
        )}
      </div>

      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title={reviewAction === 'approved' ? 'Approve request' : 'Reject request'}>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Notes for employee (optional)</label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              placeholder="Shown to the employee on this request"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          {reviewAction === 'approved' && request.request_type === 'repair' && (
            <div>
              <label className="mb-1.5 block text-base font-medium text-zinc-300">Internal repair notes (optional, private)</label>
              <textarea
                value={repairDetails}
                onChange={(e) => setRepairDetails(e.target.value)}
                rows={3}
                placeholder="What's wrong, diagnosis, plan… — not shown to the employee"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={acting}
            className={`w-full rounded-lg px-4 py-2 text-base font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
              reviewAction === 'approved' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
            }`}
          >
            {acting ? 'Submitting…' : reviewAction === 'approved' ? 'Approve' : 'Reject'}
          </button>
        </form>
      </Modal>

      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign asset">
        <form onSubmit={handleAssign} className="space-y-4">
          <p className="text-base text-zinc-400">
            Fulfilling {request.employee_name}'s request for <span className="text-zinc-200">{request.category_name}</span>.
          </p>
          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Available asset</label>
            <select
              value={chosenAssetId}
              onChange={(e) => setChosenAssetId(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="" disabled>Select an asset…</option>
              {availableAssets.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            {availableAssets.length === 0 && (
              <p className="mt-1.5 text-sm text-zinc-500">No available assets in this category right now.</p>
            )}
          </div>
          <button
            type="submit"
            disabled={acting || !chosenAssetId}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {acting ? 'Assigning…' : 'Assign'}
          </button>
        </form>
      </Modal>

      <Modal open={returnCompleteOpen} onClose={() => setReturnCompleteOpen(false)} title="Mark return completed">
        <form onSubmit={handleCompleteReturn} className="space-y-4">
          <p className="text-base text-zinc-400">
            Confirming {request.employee_name}'s return of{' '}
            <span className="text-zinc-200">{request.asset_name}</span> has been physically received.
          </p>
          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Notes (optional)</label>
            <textarea
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <button
            type="submit"
            disabled={acting}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {acting ? 'Completing…' : 'Mark completed'}
          </button>
        </form>
      </Modal>

      <Modal open={repairCompleteOpen} onClose={() => setRepairCompleteOpen(false)} title="Mark repaired & returned">
        <form onSubmit={handleCompleteRepair} className="space-y-4">
          <p className="text-base text-zinc-400">
            Confirming <span className="text-zinc-200">{request.asset_name}</span> has been repaired and returned to {request.employee_name}.
          </p>
          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Repair completion notes (optional)</label>
            <textarea
              value={repairNotes}
              onChange={(e) => setRepairNotes(e.target.value)}
              rows={3}
              placeholder="What was fixed…"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <button
            type="submit"
            disabled={acting}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {acting ? 'Completing…' : 'Mark repaired & returned'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
