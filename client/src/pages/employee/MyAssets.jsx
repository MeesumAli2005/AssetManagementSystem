import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyAssets, setAssetUsageState } from '../../api/assets';
import StatusBadge from '../../components/StatusBadge';

const STATUS_COLORS = {
  available: 'green',
  assigned: 'amber',
  under_repair: 'red',
  retired: 'slate',
  disposed: 'slate',
};

export default function MyAssets() {
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState({ active: 0, dormant: 0, under_repair: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const result = await getMyAssets();
      setAssets(result.data);
      setSummary(result.summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your assets');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleUsage(asset) {
    const nextState = asset.usage_state === 'active' ? 'dormant' : 'active';
    setTogglingId(asset.id);
    try {
      await setAssetUsageState(asset.id, nextState);
      toast.success(`"${asset.name}" marked ${nextState}`);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update usage state');
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-1 font-serif text-3xl tracking-tight text-zinc-100">My Assets</h1>
      <p className="mb-6 text-base text-zinc-500">Everything currently assigned to you.</p>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-sm">
          <p className="text-2xl font-semibold text-emerald-400">{summary.active}</p>
          <p className="text-sm text-zinc-500">Active</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-sm">
          <p className="text-2xl font-semibold text-zinc-300">{summary.dormant}</p>
          <p className="text-sm text-zinc-500">Dormant</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-sm">
          <p className="text-2xl font-semibold text-red-400">{summary.under_repair}</p>
          <p className="text-sm text-zinc-500">Under repair</p>
        </div>
      </div>

      {loading && <p className="text-base text-zinc-500">Loading…</p>}
      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>}

      {!loading && !error && (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-sm">
          {assets.map((asset) => (
            <li key={asset.id}>
              <Link
                to={`/assets/${asset.id}`}
                className="flex items-center justify-between px-4 py-3.5 transition hover:bg-zinc-800/40"
              >
                <div>
                  <p className="text-base font-medium text-zinc-100">
                    {asset.name} <span className="font-normal text-zinc-500">({asset.asset_tag})</span>
                  </p>
                  <p className="text-sm text-zinc-500">{asset.category_name || '—'}</p>
                  {!asset.acknowledged_at && (
                    <p className="mt-1 text-sm text-amber-400">Receipt not yet acknowledged</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge text={asset.status.replace('_', ' ')} color={STATUS_COLORS[asset.status]} />
                  <StatusBadge text={asset.condition} color="slate" />
                  {asset.status === 'assigned' && (
                    <StatusBadge
                      text={asset.usage_state}
                      color={asset.usage_state === 'active' ? 'green' : 'slate'}
                    />
                  )}
                  {asset.status === 'assigned' && (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleUsage(asset); }}
                      disabled={togglingId === asset.id}
                      className="text-sm font-medium text-emerald-400 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Mark {asset.usage_state === 'active' ? 'dormant' : 'active'}
                    </button>
                  )}
                </div>
              </Link>
            </li>
          ))}
          {assets.length === 0 && (
            <li className="px-4 py-6 text-center text-base text-zinc-500">No assets currently assigned to you.</li>
          )}
        </ul>
      )}
    </div>
  );
}
