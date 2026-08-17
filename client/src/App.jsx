import {Toaster} from 'react-hot-toast';
import CategoryList  from './pages/CategoryList';
import AssetList from './pages/AssetList';
import AssetDetail from './pages/AssetDetail';
import CreateAsset from './pages/CreateAsset';

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

      <Toaster
        position='top-right'

        toastOptions=
        {
          {
            style:
            {
              background: '#18181b',   // zinc-900
              color: '#f4f4f5',        // zinc-100
              border: '1px solid #27272a', // zinc-800
            },
            success: { iconTheme: { primary: '#34d399', secondary: '#18181b' } }, // emerald-400
            error: { iconTheme: { primary: '#f87171', secondary: '#18181b' } },   // red-400
          }
        }
      
      />
        <Routes>
          {/* Public routes — anyone can reach these, logged in or not */}

          <Route element={<ProtectedRoute allowedRoles={['employee', 'administrator']} />}>
          <Route element={<Layout />}>
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/assets" element={<AssetList />} />
          <Route path="/assets/:id" element={<AssetDetail />} />
          </Route>
          </Route>

          
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

              <Route path="/assets/new" element={<CreateAsset />} />
              
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
