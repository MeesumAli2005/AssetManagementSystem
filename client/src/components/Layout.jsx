import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ICONS = {

  categories: (
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3ZM6 6h.008v.008H6V6Z"
  />
  ),

  assets: (
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M21 7.5 12 2.25 3 7.5m18 0-9 5.25M21 7.5v9L12 21.75M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
  />
  ),

  dashboard: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 12h4.5v7.5h-4.5V12Zm6-6.75h4.5V19.5h-4.5V5.25Zm6 3h4.5v11.25h-4.5V8.25Z"
    />
  ),
  employees: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.5v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 3 18v1.5m18 0v-1.5a4.5 4.5 0 0 0-3-4.24M15.75 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm5.25 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  ),
  departments: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 21V9.75L12 4.5l8.25 5.25V21M8.25 21v-6h7.5v6M3.75 21h16.5"
    />
  ),
  profile: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
    />
  ),
};

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
      {ICONS[name]}
    </svg>
  );
}

const ADMIN_LINKS = [
  { to: '/categories', label: 'Categories', icon: 'categories' },
  { to: '/assets', label: 'Assets', icon: 'assets' },
  { to: '/admin', label: 'Dashboard', end: true, icon: 'dashboard' },
  { to: '/admin/employees', label: 'Employees', icon: 'employees' },
  { to: '/admin/departments', label: 'Departments', icon: 'departments' },
];

const EMPLOYEE_LINKS = [
  { to: '/employee', label: 'Dashboard', end: true, icon: 'dashboard' },
  { to: '/employee/profile', label: 'My Profile', icon: 'profile' },
  { to: '/categories', label: 'Categories', icon: 'categories' },
  { to: '/assets', label: 'Assets', icon: 'assets' },
];

function initials(name, email) {
  const source = (name || email || '?').trim();
  const parts = source.split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function Layout() {
  const { user, logout } = useAuth();
  const links = user.role === 'administrator' ? ADMIN_LINKS : EMPLOYEE_LINKS;

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 [background:radial-gradient(ellipse_1200px_500px_at_50%_-10%,rgba(16,185,129,0.10),transparent)]">
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/60 px-4 py-6">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-zinc-950 shadow-[0_0_20px_-4px_rgba(16,185,129,0.7)]">
            A
          </div>
          <span className="font-serif text-lg tracking-tight text-zinc-100">Asset Manager</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
                    : 'border-transparent text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'
                }`
              }
            >
              <Icon name={link.icon} />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/40 px-8 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-600/30 text-sm font-semibold text-emerald-300">
              {initials(user.full_name, user.email)}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-100">{user.full_name || user.email}</p>
              <p className="text-xs capitalize text-zinc-500">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
          >
            Logout
          </button>
        </header>

        <main className="flex-1 px-8 py-10">
          <div className="mx-auto max-w-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
