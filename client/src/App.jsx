import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDetail from './pages/admin/EmployeeDetail';
import EmployeeList from './pages/admin/EmployeeList';
import CreateEmployee from './pages/admin/CreateEmployee';
import DepartmentList from './pages/admin/DepartmentList';
import MyProfile from './pages/employee/MyProfile';

export default function App() 
{
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes — anyone can reach these, logged in or not */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Employee-only routes, wrapped in the shared sidebar/topbar Layout */}
          <Route element={<ProtectedRoute allowedRoles={['employee']} />}>

            <Route element={<Layout />}>
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/employee/profile" element={<MyProfile />} />

            </Route>
          </Route>




          {/* Admin-only routes, wrapped in the shared sidebar/topbar Layout */}
          <Route element={<ProtectedRoute allowedRoles={['administrator']} />}>

            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminDashboard />} />

              <Route path="/admin/employees" element={<EmployeeList />} />

              <Route path="/admin/employees/new" element={<CreateEmployee />} />
              
              <Route path="/admin/employees/:id" element={<EmployeeDetail />} />

              <Route path="/admin/departments" element={<DepartmentList />} />
            </Route>
          </Route>

          {/* Fallback — send root path to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
