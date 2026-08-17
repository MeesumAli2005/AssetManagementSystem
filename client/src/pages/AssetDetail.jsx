import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAssetById, updateAsset, retireAsset } from '../api/assets';
import { uploadDocument, downloadDocument } from '../api/documents';
import { getAllEmployees } from '../api/employees';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';

const STATUSES = ['available', 'assigned', 'under_repair', 'retired'];
const CONDITIONS = ['new', 'good', 'fair', 'damaged'];
const DOCUMENT_TYPES = ['receipt', 'repair_record', 'other'];

const STATUS_COLORS = {
  available: 'green',
  assigned: 'amber',
  under_repair: 'red',
  retired: 'slate',
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
  const [assigneeId, setAssigneeId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [savingStatus, setSavingStatus] = useState(false);

  const [retireOpen, setRetireOpen] = useState(false);
  const [retireReason, setRetireReason] = useState('');
  const [retiring, setRetiring] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('receipt');
  const [uploading, setUploading] = useState(false);

  async function loadAsset() {
    setLoading(true);
    setError('');
    try {
      const data = await getAssetById(id);
      setAsset(data);
      setStatus(data.status);
      setCondition(data.condition);
      setAssigneeId(data.current_assignee_id ?? '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load asset');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAsset();
  }, [id]);

  useEffect(() => {
    if (!isAdmin) return;
    getAllEmployees().then(setEmployees).catch(() => {});
  }, [isAdmin]);

  function handleAssigneeChange(event) {
    const value = event.target.value;
    setAssigneeId(value);
    // Picking someone auto-suggests "assigned"; clearing it auto-suggests
    // "available" — this is just a convenience default. The status
    // dropdown is still a separate control, so you can override it
    // afterward (e.g. assigned but under_repair).
    setStatus(value ? 'assigned' : 'available');
  }

  async function handleSaveStatus() {
    setSavingStatus(true);
    try {
      const newAssigneeId = assigneeId ? Number(assigneeId) : null;
      const oldAssigneeId = asset.current_assignee_id;

      await updateAsset(id, { status, condition, assignee_id: newAssigneeId });

      // One toast call, but the message reflects whichever thing actually
      // changed — the assignee takes priority since that's the most
      // significant change, then status, then condition, falling back to
      // a generic message if somehow none of them moved.
      let message = 'Asset updated';
      if (newAssigneeId !== oldAssigneeId) {
        if (newAssigneeId === null) {
          message = 'Asset unassigned';
        } else {
          const assigneeName = employees.find((emp) => emp.id === newAssigneeId)?.full_name || 'employee';
          message = oldAssigneeId ? `Reassigned to ${assigneeName}` : `Assigned to ${assigneeName}`;
        }
      } else if (status !== asset.status) {
        message = `Status changed to "${status.replace('_', ' ')}"`;
      } else if (condition !== asset.condition) {
        message = `Condition changed to "${condition}"`;
      }

      toast.success(message);
      await loadAsset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update asset');
    } finally {
      setSavingStatus(false);
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

  if (loading) return <p className="text-sm text-zinc-500">Loading…</p>;
  if (!asset) return <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error || 'Asset not found'}</p>;

  return (
    <div className="max-w-2xl">
      <Link to="/assets" className="mb-4 inline-block text-sm text-zinc-500 hover:text-emerald-400">
        ← Back to assets
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-zinc-100">{asset.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">{asset.asset_tag}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge text={asset.status.replace('_', ' ')} color={STATUS_COLORS[asset.status]} />
          <StatusBadge text={asset.condition} color="slate" />
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

      {/* Info */}
      <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <div>
          <p className="text-xs text-zinc-500">Category</p>
          <p className="text-sm text-zinc-100">{asset.category_name || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Assigned to</p>
          <p className="text-sm text-zinc-100">{asset.current_assignee_name || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Purchase date</p>
          <p className="text-sm text-zinc-100">
            {asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Purchase cost</p>
          <p className="text-sm text-zinc-100">{formatCurrency(asset.purchase_cost)}</p>
        </div>
      </div>

      {/* Specs */}
      {asset.spec_values.length > 0 && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
          <p className="mb-3 text-sm font-medium text-zinc-300">Specs</p>
          <dl className="grid grid-cols-2 gap-3">
            {asset.spec_values.map((sv) => (
              <div key={sv.id}>
                <dt className="text-xs text-zinc-500">{sv.spec_name}</dt>
                <dd className="text-sm text-zinc-100">{sv.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Admin controls */}
      {isAdmin && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
          <p className="mb-3 text-sm font-medium text-zinc-300">Manage</p>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Assigned to</label>
            <select
              value={assigneeId}
              onChange={handleAssigneeChange}
              disabled={asset.status === 'retired'}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Unassigned</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4 flex gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={asset.status === 'retired'}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              disabled={asset.status === 'retired'}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={handleSaveStatus}
              disabled={savingStatus || asset.status === 'retired' || (status === 'assigned' && !assigneeId)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingStatus ? 'Saving…' : 'Save'}
            </button>
          </div>

          {status === 'assigned' && !assigneeId && (
            <p className="mb-4 text-xs text-amber-400">Pick an assignee above before setting status to "assigned".</p>
          )}

          {asset.status !== 'retired' && (
            <button
              onClick={() => setRetireOpen(true)}
              className="text-sm font-medium text-red-400 hover:text-red-300"
            >
              Retire this asset
            </button>
          )}
        </div>
      )}

      {/* Documents */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-300">Documents</p>
          {isAdmin && (
            <button
              onClick={() => setUploadOpen(true)}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
            >
              + Upload
            </button>
          )}
        </div>
        {asset.documents.length === 0 ? (
          <p className="text-sm text-zinc-500">No documents uploaded.</p>
        ) : (
          <ul className="space-y-2">
            {asset.documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between text-sm">
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

      {/* History */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <p className="mb-3 text-sm font-medium text-zinc-300">History</p>
        {asset.history.length === 0 ? (
          <p className="text-sm text-zinc-500">No history yet.</p>
        ) : (
          <ul className="space-y-3">
            {asset.history.map((entry) => (
              <li key={entry.id} className="text-sm">
                <p className="text-zinc-300">{entry.description}</p>
                <p className="text-xs text-zinc-500">
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
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Reason</label>
            <textarea
              value={retireReason}
              onChange={(e) => setRetireReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <button
            type="submit"
            disabled={retiring}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {retiring ? 'Retiring…' : 'Retire Asset'}
          </button>
        </form>
      </Modal>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload document">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Document type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="w-full text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-sm file:text-zinc-100 hover:file:bg-zinc-600"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
