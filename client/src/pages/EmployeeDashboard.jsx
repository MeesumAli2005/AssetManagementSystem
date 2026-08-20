import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function EmployeeDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="mb-1 font-serif text-3xl tracking-tight text-zinc-100">
        Welcome, {user.full_name || user.email}
      </h1>
      <p className="mb-8 text-base text-zinc-500">Here's your workspace.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Link
          to="/employee/profile"
          className="inline-block rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-black/20"
        >
          <p className="font-medium text-zinc-100">My Profile</p>
          <p className="mt-1 text-base text-zinc-500">View your details and departments</p>
        </Link>

        <Link
          to="/employee/my-assets"
          className="inline-block rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-black/20"
        >
          <p className="font-medium text-zinc-100">My Assets</p>
          <p className="mt-1 text-base text-zinc-500">Status, condition, and usage summary</p>
        </Link>

        <Link
          to="/employee/acknowledgements"
          className="inline-block rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-black/20"
        >
          <p className="font-xl text-zinc-100">Acknowledgements</p>
          <p className="mt-1 text-base text-zinc-500">Confirm receipt of newly assigned assets</p>
        </Link>

        <Link
          to="/employee/requests"
          className="inline-block rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-black/20"
        >
          <p className="font-medium text-zinc-100">Requests</p>
          <p className="mt-1 text-base text-zinc-500">Request a new asset, return, or repair</p>
        </Link>
      </div>
    </div>
  );
}
