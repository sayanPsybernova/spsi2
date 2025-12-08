import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import ValidatorDashboard from './pages/ValidatorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (user.role === 'superadmin') return <Navigate to="/super-admin" />;
  if (user.role === 'supervisor') return <Navigate to="/supervisor" />;
  if (user.role === 'validator') return <Navigate to="/validator" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  
  return <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/super-admin" element={
        <ProtectedRoute roles={['superadmin']}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/supervisor" element={
        <ProtectedRoute roles={['supervisor']}>
          <SupervisorDashboard />
        </ProtectedRoute>
      } />

      <Route path="/validator" element={
        <ProtectedRoute roles={['validator']}>
          <ValidatorDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;