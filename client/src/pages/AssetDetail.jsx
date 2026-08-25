import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAssetById, updateAsset, retireAsset, disposeAsset, acknowledgeAssignment } from '../api/assets';
import { uploadDocument, downloadDocument } from '../api/documents';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';

// "assigned" is never manually selectable here — assignment now lives
// entirely on the employee's page (Assign asset panel), so it's excluded
// from this list. See EDITABLE_STATUSES vs. STATUS_COLORS below.
const EDITABLE_STATUSES = ['available', 'under_repair', 'retired'];
const CONDITIONS = ['new', 'good', 'fair', 'damaged'];
const DOCUMENT_TYPES = ['receipt', 'repair_record', 'other'];

const STATUS_COLORS = {
  available: 'green',
  assigned: 'amber',
  under_repair: 'red',
  retired: 'slate',
  disposed: 'slate',
};

export default function AssetDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user.role === 'administrator';

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('');
  const [condition, setCondition] = useState('');
  const [brand, setBrand] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const [retireOpen, setRetireOpen] = useState(false);
  const [retireReason, setRetireReason] = useState('');
  const [retiring, setRetiring] = useState(false);

  const [disposeOpen, setDisposeOpen] = useState(false);
  const [disposeReason, setDisposeReason] = useState('');
  const [disposing, setDisposing] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('receipt');
  const [uploading, setUploading] = useState(false);

  const [acking, setAcking] = useState(false);

  async function loadAsset() {
    setLoading(true);
    setError('');
    try {
      const data = await getAssetById(id);
      setAsset(data);
      setStatus(data.status);
      setCondition(data.condition);
      setBrand(data.brand || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load asset');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAsset();
  }, [id]);

  async function handleSaveStatusCondition() {
    setSavingStatus(true);
    try {
      // Status is only included while the asset isn't currently assigned —
      // while assigned, status is locked to "assigned" and can only move
      // off that via unassigning on the employee's page.
      const payload = asset.status === 'assigned' ? { condition, brand } : { status, condition, brand };
      await updateAsset(id, payload);
      toast.success('Asset updated');
      await loadAsset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update asset');
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleAcknowledge() {
    setAcking(true);
    try {
      await acknowledgeAssignment(id);
      toast.success('Receipt acknowledged');
      await loadAsset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to acknowledge receipt');
    } finally {
      setAcking(false);
    }
  }

  async function handleRetire(event) {
    event.preventDefault();
    setRetiring(true);
    try {
      await retireAsset(id, retireReason);
      toast.success('Asset retired');
      setRetireOpen(false);
      setRetireReason('');
      await loadAsset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to retire asset');
    } finally {
      setRetiring(false);
    }
  }

  async function handleDispose(event) {
    event.preventDefault();
    setDisposing(true);
    try {
      await disposeAsset(id, disposeReason);
      toast.success('Asset disposed of');
      setDisposeOpen(false);
      setDisposeReason('');
      await loadAsset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispose of asset');
    } finally {
      setDisposing(false);
    }
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(id, file, documentType);
      toast.success('Document uploaded');
      setUploadOpen(false);
      setFile(null);
      await loadAsset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <p className="text-base text-zinc-500">Loading…</p>;
  if (!asset) return <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error || 'Asset not found'}</p>;

  return (
    <div className="max-w-2xl">
      <Link to="/assets" className="mb-4 inline-block text-base text-zinc-500 hover:text-emerald-400">
        ← Back to assets
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-zinc-100">{asset.name}</h1>
        </div>
        <div className="flex gap-2">
          <StatusBadge text={asset.status.replace('_', ' ')} color={STATUS_COLORS[asset.status]} />
          <StatusBadge text={asset.condition} color="slate" />
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>}

      {!isAdmin && asset.my_assignment && !asset.my_assignment.acknowledged_at && (
        <div className="mb-6 flex items-center justify-between rounded-lg bg-amber-500/10 px-4 py-3">
          <p className="text-base text-amber-400">You haven't acknowledged receipt of this asset yet.</p>
          <button
            onClick={handleAcknowledge}
            disabled={acking}
            className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {acking ? 'Acknowledging…' : 'Acknowledge'}
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <div>
          <p className="text-sm text-zinc-500">Category</p>
          <p className="text-base text-zinc-100">{asset.category_name || '—'}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Assigned to</p>
          <p className="text-base text-zinc-100">{asset.current_assignee_name || '—'}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Purchase date</p>
          <p className="text-base text-zinc-100">
            {asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : '—'}
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Purchase cost</p>
          <p className="text-base text-zinc-100">{formatCurrency(asset.purchase_cost)}</p>
        </div>
        {!isAdmin && asset.my_assignment && (
          <div>
            <p className="text-sm text-zinc-500">Assigned to you since</p>
            <p className="text-base text-zinc-100">{new Date(asset.my_assignment.assigned_at).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {/* Specs */}
      {asset.spec_values.length > 0 && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
          <p className="mb-3 text-base font-medium text-zinc-300">Specs</p>
          <dl className="grid grid-cols-2 gap-3">
            {asset.spec_values.map((sv) => (
              <div key={sv.id}>
                <dt className="text-sm text-zinc-500">{sv.spec_name}</dt>
                <dd className="text-base text-zinc-100">{sv.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Admin controls */}
      {isAdmin && (
        <>
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
            <p className="mb-1 text-base font-medium text-zinc-300">Assignment</p>
            {asset.current_assignee_name ? (
              <p className="text-base text-zinc-400">
                Assigned to{' '}
                <Link to={`/admin/employees/${asset.current_assignee_id}`} className="font-medium text-emerald-400 hover:text-emerald-300">
                  {asset.current_assignee_name}
                </Link>
                . Reassign or unassign from that employee's page.
              </p>
            ) : (
              <p className="text-base text-zinc-400">
                Not assigned. Assign it from{' '}
                <Link to="/admin/employees" className="font-medium text-emerald-400 hover:text-emerald-300">
                  an employee's page
                </Link>
                .
              </p>
            )}
          </div>

          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
            <p className="mb-3 text-base font-medium text-zinc-300">Brand, Status &amp; Condition</p>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm text-zinc-500">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={asset.status === 'retired' || asset.status === 'disposed'}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="mt-1.5 text-sm text-zinc-500">Changing this recomputes the asset's display name.</p>
            </div>
            <div className="mb-4 flex gap-3">
              {asset.status === 'assigned' ? (
                <div className="flex flex-1 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-base text-zinc-500">
                  Status is locked to "assigned" while this asset has an assignee.
                </div>
              ) : (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={asset.status === 'retired' || asset.status === 'disposed'}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {EDITABLE_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              )}
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                disabled={asset.status === 'retired' || asset.status === 'disposed'}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={handleSaveStatusCondition}
                disabled={savingStatus || asset.status === 'retired' || asset.status === 'disposed'}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingStatus ? 'Saving…' : 'Save'}
              </button>
            </div>

            <div className="flex gap-4">
              {asset.status !== 'retired' && asset.status !== 'disposed' && (
                <button
                  onClick={() => { setRetireReason(''); setRetireOpen(true); }}
                  className="text-base font-medium text-red-400 hover:text-red-300"
                >
                  Retire this asset
                </button>
              )}
              {asset.status !== 'disposed' && (
                <button
                  onClick={() => { setDisposeReason(''); setDisposeOpen(true); }}
                  className="text-base font-medium text-red-400 hover:text-red-300"
                >
                  Dispose of this asset
                </button>
              )}
            </div>

            {asset.status === 'disposed' && asset.disposed_at && (
              <p className="mt-3 text-base text-zinc-500">Disposed of on {new Date(asset.disposed_at).toLocaleDateString()}</p>
            )}
          </div>
        </>
      )}

      {/* Documents */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-base font-medium text-zinc-300">Documents</p>
          {isAdmin && (
            <button
              onClick={() => setUploadOpen(true)}
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              + Upload
            </button>
          )}
        </div>
        {asset.documents.length === 0 ? (
          <p className="text-base text-zinc-500">No documents uploaded.</p>
        ) : (
          <ul className="space-y-2">
            {asset.documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between text-base">
                <span className="capitalize text-zinc-300">{doc.document_type.replace('_', ' ')}</span>
                <button
                  onClick={() => downloadDocument(doc.file_url)}
                  className="font-medium text-emerald-400 hover:text-emerald-300"
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* History — admins see everything; employees see only what happened
          during their own assignment window(s), scoped server-side */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <p className="mb-1 text-base font-medium text-zinc-300">History</p>
        {!isAdmin && <p className="mb-3 text-sm text-zinc-500">While this asset was assigned to you.</p>}
        {asset.history.length === 0 ? (
          <p className="text-base text-zinc-500">No history yet.</p>
        ) : (
          <ul className="space-y-3">
            {asset.history.map((entry) => (
              <li key={entry.id} className="text-base">
                <p className="text-zinc-300">{entry.description}</p>
                <p className="text-sm text-zinc-500">
                  {entry.performed_by_name || 'System'} · {new Date(entry.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={retireOpen} onClose={() => setRetireOpen(false)} title="Retire asset">
        <form onSubmit={handleRetire} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Reason</label>
            <textarea
              value={retireReason}
              onChange={(e) => setRetireReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <button
            type="submit"
            disabled={retiring}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {retiring ? 'Retiring…' : 'Retire Asset'}
          </button>
        </form>
      </Modal>

      <Modal open={disposeOpen} onClose={() => setDisposeOpen(false)} title="Dispose of asset">
        <form onSubmit={handleDispose} className="space-y-4">
          <p className="text-base text-zinc-400">
            This is a further, terminal step beyond retirement — the asset is physically gone for good. Its history is preserved.
          </p>
          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Reason</label>
            <textarea
              value={disposeReason}
              onChange={(e) => setDisposeReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <button
            type="submit"
            disabled={disposing}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {disposing ? 'Disposing…' : 'Dispose of Asset'}
          </button>
        </form>
      </Modal>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload document">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Document type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="w-full text-base text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-base file:text-zinc-100 hover:file:bg-zinc-600"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
