import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="mb-1 font-serif text-3xl tracking-tight text-zinc-100">
        Welcome, {user.full_name || user.email}
      </h1>
      <p className="mb-8 text-base text-zinc-500">Here's what you can manage today.</p>

      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/admin/requests"
          className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-black/20"
        >
          <p className="font-medium text-zinc-100">Requests</p>
          <p className="mt-1 text-base text-zinc-500">Review, approve, reject, and fulfill employee requests</p>
        </Link>

        <Link
          to="/admin/employees"
          className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-black/20"
        >
          <p className="font-medium text-zinc-100">Employees</p>
          <p className="mt-1 text-base text-zinc-500">View, search, and manage employee accounts</p>
        </Link>

        <Link
          to="/admin/departments"
          className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-black/20"
        >
          <p className="font-medium text-zinc-100">Departments</p>
          <p className="mt-1 text-base text-zinc-500">Create and manage departments</p>
        </Link>
      </div>
    </div>
  );
}
