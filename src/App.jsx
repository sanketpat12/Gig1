import { useEffect, useState } from 'react';
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
import AIAssistant from './components/AIAssistant';

const UI_BOOTSTRAP_TIMEOUT_MS = 5500;

function AuthBootstrapScreen() {
  return (
    <div style={{ minHeight: 'calc(100vh - 88px)', display: 'grid', placeItems: 'center', padding: '32px 20px' }}>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            border: '3px solid rgba(41, 98, 255, 0.15)',
            borderTopColor: 'var(--primary)',
            margin: '0 auto 14px',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Restoring your session...</p>
      </div>
    </div>
  );
}

function useLoadingBarrier(loading) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setTimedOut(true);
    }, UI_BOOTSTRAP_TIMEOUT_MS);

    return () => window.clearTimeout(timerId);
  }, [loading]);

  return loading && !timedOut;
}

function PrivateRoute({ children, role }) {
  const { currentUser, loading } = useAuth();
  const shouldBlock = useLoadingBarrier(loading);
  if (shouldBlock) return <AuthBootstrapScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && currentUser.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { currentUser, loading } = useAuth();
  const shouldBlock = useLoadingBarrier(loading);
  const dashboardPath = currentUser?.role === 'employer' ? '/employer' : '/worker';

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={shouldBlock ? <AuthBootstrapScreen /> : !currentUser ? <Login /> : <Navigate to={dashboardPath} replace />} />
        <Route path="/register" element={shouldBlock ? <AuthBootstrapScreen /> : !currentUser ? <Register /> : <Navigate to={dashboardPath} replace />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/employer" element={<PrivateRoute role="employer"><EmployerDashboard /></PrivateRoute>} />
        <Route path="/worker" element={<PrivateRoute role="worker"><WorkerDashboard /></PrivateRoute>} />
        <Route path="/worker/:id" element={<WorkerProfile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <AIAssistant />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
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
