import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes — anyone can reach these, logged in or not */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Employee-only route */}
          <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
          </Route>

          {/* Admin-only route */}
          <Route element={<ProtectedRoute allowedRoles={['administrator']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Fallback — send root path to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}