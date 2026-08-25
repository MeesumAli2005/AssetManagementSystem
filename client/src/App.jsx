import {Toaster, ToastBar, toast} from 'react-hot-toast';
import CategoryList  from './pages/CategoryList';
import AssetList from './pages/AssetList';
import AssetDetail from './pages/AssetDetail';
import CreateAsset from './pages/CreateAsset';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
//import Signup from './pages/Signup';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDetail from './pages/admin/EmployeeDetail';
import EmployeeList from './pages/admin/EmployeeList';
import CreateEmployee from './pages/admin/CreateEmployee';
import DepartmentList from './pages/admin/DepartmentList';
import MyProfile from './pages/employee/MyProfile';
import MyAssets from './pages/employee/MyAssets';
import Acknowledgements from './pages/employee/Acknowledgements';
import AcknowledgementDetail from './pages/employee/AcknowledgementDetail';
import RequestAsset from './pages/employee/RequestAsset';
import MyRequests from './pages/employee/MyRequests';
import RequestQueue from './pages/admin/RequestQueue';
import RequestDetail from './pages/admin/RequestDetail';
import MyRequestDetail from './pages/employee/RequestDetail';

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
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                {message}
                {t.type !== 'loading' && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="ml-1 rounded p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
                    aria-label="Dismiss">
                    ✕
                  </button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
        <Routes>
          {/* Public routes — anyone can reach these, logged in or not */}

          <Route element={<ProtectedRoute allowedRoles={['employee', 'administrator']} />}>
          <Route element={<Layout />}>
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/assets/:id" element={<AssetDetail />} />
          </Route>
          </Route>

          
          <Route path="/login" element={<Login />} />
          {/*<Route path="/signup" element={<Signup />} /> */}

          {/* Employee-only routes, wrapped in the shared sidebar/topbar Layout */}
          <Route element={<ProtectedRoute allowedRoles={['employee']} />}>

            <Route element={<Layout />}>
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/employee/profile" element={<MyProfile />} />
              <Route path="/employee/my-assets" element={<MyAssets />} />
              <Route path="/employee/acknowledgements" element={<Acknowledgements />} />
              <Route path="/employee/acknowledgements/:id" element={<AcknowledgementDetail />} />
              <Route path="/employee/requests" element={<MyRequests />} />
              <Route path="/employee/requests/new" element={<RequestAsset />} />
              <Route path="/employee/requests/:id" element={<MyRequestDetail />} />

            </Route>
          </Route>




          {/* Admin-only routes, wrapped in the shared sidebar/topbar Layout */}
          <Route element={<ProtectedRoute allowedRoles={['administrator']} />}>

            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminDashboard />} />

              <Route path="/admin/employees" element={<EmployeeList />} />

              <Route path="/admin/employees/new" element={<CreateEmployee />} />

              <Route path="/assets/new" element={<CreateAsset />} />
              <Route path="/assets" element={<AssetList />} />

              <Route path="/admin/employees/:id" element={<EmployeeDetail />} />

              <Route path="/admin/departments" element={<DepartmentList />} />

              <Route path="/admin/requests" element={<RequestQueue />} />
              <Route path="/admin/requests/:id" element={<RequestDetail />} />
            </Route>
          </Route>

          {/* Fallback — send root path to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>

      </BrowserRouter>

    </AuthProvider>
  );
}
