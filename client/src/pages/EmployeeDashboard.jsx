import { useAuth } from '../context/AuthContext';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Employee Dashboard</h1>
      <p>Welcome, {user.full_name || user.email}</p>
      <button onClick={logout}>Logout</button>
      {/* the remaining things are to be done later*/}
    </div>
  );
}