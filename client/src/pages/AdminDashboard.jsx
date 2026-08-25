import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAssetStats } from '../api/assets';
import StatTile from '../components/StatTile';
import BarBreakdown from '../components/BarBreakdown';

const STATUS_ROWS = [
  { key: 'available', color: 'green' },
  { key: 'assigned', color: 'amber' },
  { key: 'under_repair', color: 'red' },
  { key: 'retired', color: 'slate' },
  { key: 'disposed', color: 'slate' },
];

const CONDITION_ROWS = [
  { key: 'new', color: 'green' },
  { key: 'good', color: 'green' },
  { key: 'fair', color: 'amber' },
  { key: 'damaged', color: 'red' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAssetStats().then(setStats).catch(() => {});
  }, []);

  const byStatus = stats?.byStatus || {};
  const byCondition = stats?.byCondition || {};

  return (
    <div>
      <h1 className="mb-1 font-serif text-3xl font-bold tracking-tight text-zinc-100">
        Welcome, {user.full_name || user.email}
      </h1>
      <p className="mb-8 text-base text-zinc-500">Here's what you can manage today.</p>

      {stats && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatTile label="Total assets" value={stats.total} />
            {STATUS_ROWS.map((row) => (
              <StatTile key={row.key} label={row.key.replace('_', ' ')} value={byStatus[row.key] || 0} />
            ))}
          </div>

          <div className="space-y-4">
            <BarBreakdown
              title="Assets by status"
              rows={STATUS_ROWS.map((row) => ({ label: row.key, value: byStatus[row.key] || 0, color: row.color }))}
            />
            <BarBreakdown
              title="Assets by condition"
              rows={CONDITION_ROWS.map((row) => ({ label: row.key, value: byCondition[row.key] || 0, color: row.color }))}
            />
          </div>
        </>
      )}
    </div>
  );
}
