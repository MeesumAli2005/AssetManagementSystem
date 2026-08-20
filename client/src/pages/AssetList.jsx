import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllAssets } from '../api/assets';
import { getAllCategories } from '../api/categories';
import { getAllDepartments } from '../api/departments';
import { getAllEmployees } from '../api/employees';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['available', 'assigned', 'under_repair', 'retired'];
const PAGE_SIZE = 10;

const STATUS_COLORS = {
  available: 'green',
  assigned: 'amber',
  under_repair: 'red',
  retired: 'slate',
};

export default function AssetList()
{
    const { user } = useAuth();
    const isAdmin = user.role === 'administrator';

    // Lets a link like /assets?assignee_id=11 (from an employee's detail
    // page) land here with that filter already applied, instead of
    // dumping you on the unfiltered list.
    const [searchParams] = useSearchParams();

    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [status, setStatus] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [assigneeId, setAssigneeId] = useState(() => searchParams.get('assignee_id') || '');
    const [assignedFilter, setAssignedFilter] = useState('');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter dropdown options only need to be fetched once.
    useEffect(() => {
        getAllCategories().then(setCategories).catch(() => {});
        getAllDepartments().then(setDepartments).catch(() => {});
        getAllEmployees().then(setEmployees).catch(() => {});
    }, []);

    // Any time a filter changes, we're looking at a different result set,
    // so whatever page we were on no longer means anything — snap back to
    // page 1. This effect only handles that; the fetch itself happens in
    // the effect below, which also runs whenever `page` changes here.
    useEffect(() => {
        setPage(1);
    }, [search, categoryId, status, departmentId, assigneeId, assignedFilter]);

    useEffect(() =>
    {
        const timeoutId = setTimeout(() =>
        {
            setLoading(true);
            setError('');
            getAllAssets({
                search: search || undefined,
                category_id: categoryId || undefined,
                status: status || undefined,
                department_id: departmentId || undefined,
                assignee_id: assigneeId || undefined,
                assigned: assignedFilter || undefined,
                page,
                limit: PAGE_SIZE,
            })
                .then((result) => {
                    setAssets(result.data);
                    setTotalPages(result.totalPages);
                    setTotal(result.total);
                })
                .catch((err) => setError(err.response?.data?.message || 'Failed to load assets'))
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, categoryId, status, departmentId, assigneeId, assignedFilter, page]);

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-3xl tracking-tight text-zinc-100">Assets</h1>
                    <p className="mt-1 text-base text-zinc-500">Search, filter, and track your inventory.</p>
                </div>
                {isAdmin && (
                    <Link
                        to="/assets/new"
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500"
                    >
                        New Asset
                    </Link>
                )}
            </div>

            <div className="mb-4 flex flex-wrap gap-3">
                <input
                    type="text"
                    placeholder="Search by name or asset tag…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 placeholder:text-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                    <option value="">All statuses</option>
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                </select>
                <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                    <option value="">All departments</option>
                    {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                </select>
                <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                    <option value="">All employees</option>
                    {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                    ))}
                </select>
                <select
                    value={assignedFilter}
                    onChange={(e) => setAssignedFilter(e.target.value)}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                    <option value="">Assigned or unassigned</option>
                    <option value="true">Assigned only</option>
                    <option value="false">Unassigned only</option>
                </select>
            </div>

            {loading && <p className="text-base text-zinc-500">Loading…</p>}
            {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>}

            {!loading && !error && (
                <>
                    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-sm">
                        <table className="w-full border-collapse text-base">
                            <thead className="bg-zinc-800/50 text-left">
                                <tr>
                                    <th className="px-4 py-2.5 font-medium text-zinc-400">Asset Tag</th>
                                    <th className="px-4 py-2.5 font-medium text-zinc-400">Name</th>
                                    <th className="px-4 py-2.5 font-medium text-zinc-400">Category</th>
                                    <th className="px-4 py-2.5 font-medium text-zinc-400">Assignee</th>
                                    <th className="px-4 py-2.5 font-medium text-zinc-400">Status</th>
                                    <th className="px-4 py-2.5"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {assets.map((asset) => (
                                    <tr key={asset.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                                        <td className="px-4 py-2.5 font-medium text-zinc-100">{asset.asset_tag}</td>
                                        <td className="px-4 py-2.5 text-zinc-300">{asset.name}</td>
                                        <td className="px-4 py-2.5 text-zinc-400">{asset.category_name || '—'}</td>
                                        <td className="px-4 py-2.5 text-zinc-400">{asset.current_assignee_name || '—'}</td>
                                        <td className="px-4 py-2.5">
                                            <StatusBadge text={asset.status.replace('_', ' ')} color={STATUS_COLORS[asset.status]} />
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            <Link
                                                to={`/assets/${asset.id}`}
                                                className="inline-flex text-zinc-500 hover:text-emerald-400"
                                                aria-label={`View ${asset.name}`}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                                </svg>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {assets.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                                            No assets found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {total > 0 && (
                        <div className="mt-4 flex items-center justify-between text-base text-zinc-500">
                            <p>
                                Page {page} of {totalPages} · {total} asset{total === 1 ? '' : 's'}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                    disabled={page <= 1}
                                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-base text-zinc-200 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={page >= totalPages}
                                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-base text-zinc-200 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
