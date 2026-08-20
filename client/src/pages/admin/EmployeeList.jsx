import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllEmployees } from '../../api/employees';
import { getAllDepartments } from '../../api/departments';
import StatusBadge from '../../components/StatusBadge';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Departments only need to be fetched once, to populate the filter dropdown.
  useEffect(() => {
    getAllDepartments()
      .then(setDepartments)
      .catch(() => {});
  }, []);

  // Re-fetch employees whenever the search text or department filter
  // changes. Debounced so we're not hitting the API on every keystroke.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(true);
      setError('');
      getAllEmployees({ search: search || undefined, department_id: departmentId || undefined })
        .then(setEmployees)
        .catch((err) => setError(err.response?.data?.message || 'Failed to load employees'))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, departmentId]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-zinc-100">Employees</h1>
          <p className="mt-1 text-base text-zinc-500">Search, filter, and manage employee accounts.</p>
        </div>
        <Link
          to="/admin/employees/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500"
        >
          New Employee
        </Link>
      </div>

      <div className="mb-4 flex gap-3">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-64 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 placeholder:text-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
        <select
          value={departmentId}
          onChange={(event) => setDepartmentId(event.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        >
          <option value="">All departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-base text-zinc-500">Loading…</p>}
      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-sm">
          <table className="w-full border-collapse text-base">
            <thead className="bg-zinc-800/50 text-left">
              <tr>
                <th className="px-4 py-2.5 font-medium text-zinc-400">Name</th>
                <th className="px-4 py-2.5 font-medium text-zinc-400">Email</th>
                <th className="px-4 py-2.5 font-medium text-zinc-400">Departments</th>
                <th className="px-4 py-2.5 font-medium text-zinc-400">Status</th>
                <th className="px-4 py-2.5"></th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/admin/employees/${emp.id}`}
                      className="font-medium text-zinc-100 hover:text-emerald-400"
                    >
                      {emp.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-400">{emp.email}</td>
                  <td className="px-4 py-2.5 text-zinc-400">
                    {emp.departments.map((d) => d.name).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge
                      text={emp.is_active ? 'Active' : 'Inactive'}
                      color={emp.is_active ? 'green' : 'red'}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      to={`/assets?assignee_id=${emp.id}`}
                      className="inline-flex text-zinc-500 hover:text-emerald-400"
                      aria-label={`View assets assigned to ${emp.full_name}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 7.5 12 2.25 3 7.5m18 0-9 5.25M21 7.5v9L12 21.75M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                        />
                      </svg>
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                  <Link
                    to={`/admin/employees/${emp.id}`}
                    className="inline-flex text-zinc-500 hover:text-emerald-400"
                    aria-label={`Edit ${emp.full_name}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                      />
                    </svg>
                  </Link>
                </td>
              </tr>))}

              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
