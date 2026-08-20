import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createRequest } from '../../api/requests';
import { getAllCategories } from '../../api/categories';
import { getMyAssets } from '../../api/assets';

const REQUEST_TYPES = [
  { value: 'asset', label: 'New asset' },
  { value: 'return', label: 'Return an asset' },
  { value: 'repair', label: 'Report a repair' },
];

export default function RequestAsset() {
  const navigate = useNavigate();

  const [requestType, setRequestType] = useState('asset');
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [myAssets, setMyAssets] = useState([]);
  const [assetId, setAssetId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => {});
    getMyAssets().then((result) => setMyAssets(result.data)).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload =
        requestType === 'asset'
          ? { request_type: 'asset', category_id: Number(categoryId), reason }
          : { request_type: requestType, asset_id: Number(assetId), reason };

      const result = await createRequest(payload);

      let message = 'Request submitted';
      if (requestType === 'asset' && typeof result.available_count === 'number') {
        message = result.available_count > 0
          ? `Request submitted — ${result.available_count} available in this category right now`
          : 'Request submitted — none currently available in this category';
      }
      toast.success(message);

      navigate('/employee/requests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="mb-1 font-serif text-3xl tracking-tight text-zinc-100">Request Asset</h1>
      <p className="mb-6 text-base text-zinc-500">Request a new asset, or a return/repair for one already assigned to you.</p>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <div>
          <label className="mb-1.5 block text-base font-medium text-zinc-300">Request type</label>
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            {REQUEST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {requestType === 'asset' ? (
          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="" disabled>Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Asset</label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="" disabled>Select an asset…</option>
              {myAssets.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.asset_tag})</option>
              ))}
            </select>
            {myAssets.length === 0 && (
              <p className="mt-1.5 text-sm text-zinc-500">You have no assets currently assigned to you.</p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-base font-medium text-zinc-300">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={3}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || (requestType !== 'asset' && myAssets.length === 0)}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit request'}
        </button>
      </form>
    </div>
  );
}
