import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyProfile, updateMyProfile } from '../../api/employees';
import { changePassword } from '../../api/auth';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');


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
    try {
      await updateMyProfile(fullName);
      setProfile((prev) => ({ ...prev, full_name: fullName }));
      toast.success('Profile updated');
    }

    catch (err)
    {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    }

    finally
    {
      setSaving(false);
    }
  }

  function openPasswordModal() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordOpen(true);
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      toast.success('Password changed');
      setPasswordOpen(false);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loading) return <p className="text-base text-zinc-500">Loading…</p>;
  if (!profile) return <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error || 'Profile not found'}</p>;

  return (
    <div className="max-w-md">
      <h1 className="mb-6 font-serif text-3xl font-bold tracking-tight text-zinc-100">My Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <div>
          <label className="mb-1.5 block text-base font-medium text-zinc-300">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-base font-medium text-zinc-300">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-base text-zinc-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={openPasswordModal}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-base font-medium text-zinc-200 transition hover:bg-zinc-700"
          >
            Change Password
          </button>
        </div>
      </form>

      <div className="mt-8">
        <p className="mb-2 text-base font-medium text-zinc-300">My departments</p>
        {profile.departments.length === 0 ? (
          <p className="text-base text-zinc-500">Not assigned to any department yet.</p>
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

      <Link
        to="/employee/my-assets"
        className="mt-8 inline-flex items-center gap-1.5 text-base font-medium text-emerald-400 hover:text-emerald-300"
      >
        View my assets ({profile.assigned_assets.length})
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-3.5 w-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </Link>

      <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {passwordError && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{passwordError}</p>
          )}

          <button
            type="submit"
            disabled={passwordSaving}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {passwordSaving ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
