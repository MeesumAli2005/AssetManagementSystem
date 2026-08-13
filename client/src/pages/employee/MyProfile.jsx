import { useEffect, useState } from 'react';
import { getMyProfile, updateMyProfile } from '../../api/employees';
import StatusBadge from '../../components/StatusBadge';

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);


  // use effect will put the code inside it as a side affect
  useEffect(() => 
  {
    getMyProfile()
      .then((data) => 
      {
        setProfile(data);
        setFullName(data.full_name || '');
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event) 
  {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateMyProfile(fullName);
      setProfile((prev) => ({ ...prev, full_name: fullName }));
      setSaved(true);
    } 
    
    catch (err) 
    {
      setError(err.response?.data?.message || 'Failed to save profile');
    } 
    
    finally 
    {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-zinc-500">Loading…</p>;
  if (!profile) return <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error || 'Profile not found'}</p>;

  return (
    <div className="max-w-md">
      <h1 className="mb-6 font-serif text-3xl tracking-tight text-zinc-100">My Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-500"
          />
        </div>

        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
        {saved && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">Saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-zinc-300">My departments</p>
        {profile.departments.length === 0 ? (
          <p className="text-sm text-zinc-500">Not assigned to any department yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {profile.departments.map((dept) => (
              <li key={dept.id}>
                <StatusBadge text={dept.name} color="slate" />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-zinc-300">Assets assigned to me</p>
        {profile.assigned_assets.length === 0 ? (
          <p className="text-sm text-zinc-500">No assets currently assigned.</p>
        ) : (
          <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-sm">
            {profile.assigned_assets.map((asset) => (
              <li key={asset.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-zinc-100">
                  {asset.name} <span className="text-zinc-500">({asset.asset_tag})</span>
                </span>
                <StatusBadge text={asset.status} color="slate" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
