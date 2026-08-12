import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function EmployeeDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="mb-1 font-serif text-3xl tracking-tight text-zinc-100">
        Welcome, {user.full_name || user.email}
      </h1>
      <p className="mb-8 text-sm text-zinc-500">Here's your workspace.</p>

      <Link
        to="/employee/profile"
        className="inline-block rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-black/20"
      >
        <p className="font-medium text-zinc-100">My Profile</p>
        <p className="mt-1 text-sm text-zinc-500">View your details, departments, and assigned assets</p>
      </Link>
    </div>
  );
}
