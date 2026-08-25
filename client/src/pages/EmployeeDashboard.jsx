import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyAssets } from '../api/assets';
import StatTile from '../components/StatTile';
import BarBreakdown from '../components/BarBreakdown';

const CONDITION_ROWS = [
  { key: 'new', color: 'green' },
  { key: 'good', color: 'green' },
  { key: 'fair', color: 'amber' },
  { key: 'damaged', color: 'red' },
];

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [assets, setAssets] = useState(null);

  useEffect(() => {
    getMyAssets().then((result) => setAssets(result.data)).catch(() => {});
  }, []);

  const byCondition = { new: 0, good: 0, fair: 0, damaged: 0 };
  for (const asset of assets || []) {
    if (byCondition[asset.condition] !== undefined) byCondition[asset.condition] += 1;
  }

  return (
    <div>
      <h1 className="mb-1 font-serif text-3xl font-bold tracking-tight text-zinc-100">
        Welcome, {user.full_name || user.email}
      </h1>
      <p className="mb-8 text-base text-zinc-500">Here's your workspace.</p>

      {assets && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatTile label="Assets assigned to me" value={assets.length} />
            <StatTile label="Under repair" value={assets.filter((a) => a.status === 'under_repair').length} />
          </div>

          {assets.length > 0 && (
            <div className="mb-8">
              <BarBreakdown
                title="My assets by condition"
                rows={CONDITION_ROWS.map((row) => ({ label: row.key, value: byCondition[row.key], color: row.color }))}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
