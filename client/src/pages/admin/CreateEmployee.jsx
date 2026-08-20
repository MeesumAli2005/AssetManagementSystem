import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEmployee } from '../../api/employees';

export default function CreateEmployee() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await createEmployee({
        full_name: fullName,
        email,
        temporary_password: temporaryPassword,
        role,
      });
      navigate(`/admin/employees/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-1 font-serif text-3xl tracking-tight text-zinc-100">New Employee</h1>
      <p className="mb-6 text-base text-zinc-500">Create an account and share the temporary password.</p>

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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-base font-medium text-zinc-300">Temporary password</label>
          <input
            type="text"
            value={temporaryPassword}
            onChange={(event) => setTemporaryPassword(event.target.value)}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          <p className="mt-1.5 text-sm text-zinc-500">Share this with the employee securely — it won't be shown again.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-base font-medium text-zinc-300">Role</label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="employee">Employee</option>
            <option value="administrator">Administrator</option>
          </select>
        </div>

        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Creating…' : 'Create Employee'}
        </button>
      </form>
    </div>
  );
}
