import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getEmployeeById, updateEmployee, setEmployeeActiveStatus, resetEmployeePassword } from '../../api/employees';
import { getAllDepartments } from '../../api/departments';
import { getAllAssets, updateAsset } from '../../api/assets';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

const ASSET_STATUS_COLORS = {
  available: 'green',
  assigned: 'amber',
  under_repair: 'red',
  retired: 'slate',
  disposed: 'slate',
};

export default function EmployeeDetail() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [allDepartments, setAllDepartments] = useState([]);
  const [fullName, setFullName] = useState('');
  const [selectedDeptIds, setSelectedDeptIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [resetOpen, setResetOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [tempPasswordConfirm, setTempPasswordConfirm] = useState('');
  const [resetSaving, setResetSaving] = useState(false);
  const [resetError, setResetError] = useState('');

  const [availableAssets, setAvailableAssets] = useState([]);
  const [assetToAssign, setAssetToAssign] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [unassigningId, setUnassigningId] = useState(null);

  // Loads (or reloads) everything this page needs. Called on mount and
  // again after any successful save, so the UI always reflects the server.
  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [employeeData, departmentsData, availableAssetsResult] = await Promise.all([
        getEmployeeById(id),
        getAllDepartments(),
        getAllAssets({ status: 'available', limit: 100 }),
      ]);

      setEmployee(employeeData);
      setAllDepartments(departmentsData);
      setFullName(employeeData.full_name || '');
      setSelectedDeptIds(employeeData.departments.map((d) => d.id));
      setAvailableAssets(availableAssetsResult.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employee');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function toggleDepartment(deptId) {
    setSelectedDeptIds((prev) =>
      prev.includes(deptId) ? prev.filter((existingId) => existingId !== deptId) : [...prev, deptId]
    );
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const nameChanged = fullName !== employee.full_name;
      const oldDeptIds = employee.departments.map((d) => d.id).sort();
      const newDeptIds = [...selectedDeptIds].sort();
      const deptsChanged = JSON.stringify(oldDeptIds) !== JSON.stringify(newDeptIds);

      await updateEmployee(id, { full_name: fullName, department_ids: selectedDeptIds });

      // Same idea as the asset save toast — one call, message depends on
      // which of the two things this save actually touched.
      let message = 'Employee updated';
      if (nameChanged && deptsChanged) message = 'Profile and departments updated';
      else if (deptsChanged) message = 'Departments updated';
      else if (nameChanged) message = 'Profile updated';

      toast.success(message);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  function openResetModal() {
    setTempPassword('');
    setTempPasswordConfirm('');
    setResetError('');
    setResetOpen(true);
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setResetError('');

    if (tempPassword !== tempPasswordConfirm) {
      setResetError('Passwords do not match');
      return;
    }

    setResetSaving(true);
    try {
      await resetEmployeePassword(id, tempPassword);
      toast.success(`Password reset for ${employee.full_name}`);
      setResetOpen(false);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetSaving(false);
    }
  }

  async function handleToggleActive() {
    setSaving(true);
    try {
      const activating = !employee.is_active;
      await setEmployeeActiveStatus(id, activating);
      toast.success(activating ? 'Employee activated' : 'Employee deactivated');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  }

  async function handleAssign() {
    if (!assetToAssign) return;
    setAssigning(true);
    try {
      const asset = availableAssets.find((a) => a.id === Number(assetToAssign));
      await updateAsset(assetToAssign, { assignee_id: Number(id) });
      toast.success(`"${asset?.name || 'Asset'}" assigned to ${employee.full_name}`);
      setAssetToAssign('');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign asset');
    } finally {
      setAssigning(false);
    }
  }

  async function handleUnassign(asset) {
    setUnassigningId(asset.id);
    try {
      // Status isn't sent — the backend derives it (back to "available",
      // or whatever it was before if it's under_repair) from the
      // assignee_id change alone.
      await updateAsset(asset.id, { assignee_id: null });
      toast.success(`"${asset.name}" unassigned`);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unassign asset');
    } finally {
      setUnassigningId(null);
    }
  }

  if (loading) return <p className="text-base text-zinc-500">Loading…</p>;
  if (!employee) return <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error || 'Employee not found'}</p>;

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-zinc-100">{employee.full_name}</h1>
          <p className="text-base text-zinc-500">{employee.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge
            text={employee.is_active ? 'Active' : 'Inactive'}
            color={employee.is_active ? 'green' : 'red'}
          />
          <button
            onClick={handleToggleActive}
            disabled={saving}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-base font-medium text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50"
          >
            {employee.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={openResetModal}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-base font-medium text-zinc-200 transition hover:bg-zinc-700"
          >
            Reset Password
          </button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>}

      <form onSubmit={handleSave} className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
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
          <p className="mb-2 text-base font-medium text-zinc-300">Departments</p>
          <div className="space-y-2">
            {allDepartments.map((dept) => (
              <label key={dept.id} className="flex items-center gap-2 text-base text-zinc-300">
                <input
                  type="checkbox"
                  checked={selectedDeptIds.includes(dept.id)}
                  onChange={() => toggleDepartment(dept.id)}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/30"
                />
                {dept.name}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <p className="mb-3 text-base font-medium text-zinc-300">Assign asset</p>
        <div className="flex gap-3">
          <select
            value={assetToAssign}
            onChange={(e) => setAssetToAssign(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">Select an available asset…</option>
            {availableAssets.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            disabled={assigning || !assetToAssign}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {assigning ? 'Assigning…' : 'Assign'}
          </button>
        </div>
        {availableAssets.length === 0 && (
          <p className="mt-1.5 text-sm text-zinc-500">No available assets right now.</p>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-base font-medium text-zinc-300">Assigned assets ({employee.assigned_assets.length})</p>
          <Link
            to={`/assets?assignee_id=${id}`}
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            View full details
          </Link>
        </div>
        {employee.assigned_assets.length === 0 ? (
          <p className="text-base text-zinc-500">No assets currently assigned.</p>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {employee.assigned_assets.map((asset) => (
              <li key={asset.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-base font-medium text-zinc-100">
                    {asset.name}
                  </p>
                  {/* Status and condition are read-only here — this page only
                      manages who has the asset, not its status/condition. */}
                  <div className="mt-1 flex gap-1.5">
                    <StatusBadge text={asset.status.replace('_', ' ')} color={ASSET_STATUS_COLORS[asset.status]} />
                    <StatusBadge text={asset.condition} color="slate" />
                  </div>
                </div>
                <button
                  onClick={() => handleUnassign(asset)}
                  disabled={unassigningId === asset.id}
                  className="text-sm font-medium text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {unassigningId === asset.id ? 'Unassigning…' : 'Unassign'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset Password">
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-base text-zinc-500">
            Set a temporary password for {employee.full_name}. Share it with them securely.
          </p>

          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">New temporary password</label>
            <input
              type="password"
              value={tempPassword}
              onChange={(event) => setTempPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Confirm password</label>
            <input
              type="password"
              value={tempPasswordConfirm}
              onChange={(event) => setTempPasswordConfirm(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {resetError && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{resetError}</p>
          )}

          <button
            type="submit"
            disabled={resetSaving}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resetSaving ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
