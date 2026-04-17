import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployerDashboard from './pages/EmployerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerProfile from './pages/WorkerProfile';
import ConfirmEmail from './pages/ConfirmEmail';
import Navbar from './components/Navbar';

function PrivateRoute({ children, role }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && currentUser.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { currentUser } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to={currentUser.role === 'employer' ? '/employer' : '/worker'} />} />
        <Route path="/register" element={!currentUser ? <Register /> : <Navigate to={currentUser.role === 'employer' ? '/employer' : '/worker'} />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/employer" element={<PrivateRoute role="employer"><EmployerDashboard /></PrivateRoute>} />
        <Route path="/worker" element={<PrivateRoute role="worker"><WorkerDashboard /></PrivateRoute>} />
        <Route path="/worker/:id" element={<WorkerProfile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
