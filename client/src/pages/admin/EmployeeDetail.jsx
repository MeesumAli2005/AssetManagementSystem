import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEmployeeById, updateEmployee, setEmployeeActiveStatus } from '../../api/employees';
import { getAllDepartments } from '../../api/departments';
import StatusBadge from '../../components/StatusBadge';

export default function EmployeeDetail() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [allDepartments, setAllDepartments] = useState([]);
  const [fullName, setFullName] = useState('');
  const [selectedDeptIds, setSelectedDeptIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Loads (or reloads) everything this page needs. Called on mount and
  // again after any successful save, so the UI always reflects the server.
  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [employeeData, departmentsData] = await Promise.all([
        getEmployeeById(id),
        getAllDepartments(),
      ]);

      setEmployee(employeeData);
      setAllDepartments(departmentsData);
      setFullName(employeeData.full_name || '');
      setSelectedDeptIds(employeeData.departments.map((d) => d.id));
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
    setError('');
    try {
      await updateEmployee(id, { full_name: fullName, department_ids: selectedDeptIds });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    setSaving(true);
    setError('');
    try {
      await setEmployeeActiveStatus(id, !employee.is_active);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-zinc-500">Loading…</p>;
  if (!employee) return <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error || 'Employee not found'}</p>;

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-zinc-100">{employee.full_name}</h1>
          <p className="text-sm text-zinc-500">{employee.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge
            text={employee.is_active ? 'Active' : 'Inactive'}
            color={employee.is_active ? 'green' : 'red'}
          />
          <button
            onClick={handleToggleActive}
            disabled={saving}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50"
          >
            {employee.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

      <form onSubmit={handleSave} className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
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
          <p className="mb-2 text-sm font-medium text-zinc-300">Departments</p>
          <div className="space-y-2">
            {allDepartments.map((dept) => (
              <label key={dept.id} className="flex items-center gap-2 text-sm text-zinc-300">
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
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-zinc-300">Assigned assets</p>
        {employee.assigned_assets.length === 0 ? (
          <p className="text-sm text-zinc-500">No assets currently assigned.</p>
        ) : (
          <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-sm">
            {employee.assigned_assets.map((asset) => (
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
