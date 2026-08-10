import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() 
{
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Administrator Dashboard</h1>
      <p>Welcome, {user.full_name || user.email}</p>
      <button onClick={logout}>Logout</button>
      {/* later*/}
    </div>
  );
}