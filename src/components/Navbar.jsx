import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LogOut, User, Home, Search, Menu, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <div className="logo-icon">
            <Briefcase size={18} />
          </div>
          <span className="logo-text">GigNav</span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <Home size={15} /> Home
          </Link>
          {currentUser?.role === 'employer' && (
            <Link to="/employer" className={`nav-link ${isActive('/employer') ? 'active' : ''}`}>
              <Search size={15} /> Find Workers
            </Link>
          )}
          {currentUser?.role === 'worker' && (
            <Link to="/worker" className={`nav-link ${isActive('/worker') ? 'active' : ''}`}>
              <User size={15} /> My Dashboard
            </Link>
          )}
        </div>

        {/* Auth Buttons / User */}
        <div className="navbar-auth">
          {loading ? (
            <div style={{ minWidth: '150px', height: '40px' }} />
          ) : currentUser ? (
            <div className="navbar-user">
              <div className="user-chip">
                <div className="avatar avatar-sm" style={{ background: currentUser.role === 'employer' ? 'linear-gradient(135deg,var(--primary),var(--primary-dark))' : 'linear-gradient(135deg,#43e97b,#38f9d7)', fontSize:'0.8rem' }}>
                  {currentUser.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="user-info">
                  <span className="user-name">{currentUser.name}</span>
                  <span className={`badge ${currentUser.role === 'employer' ? 'badge-primary' : 'badge-success'}`} style={{ padding:'2px 8px', fontSize:'0.68rem' }}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <button id="logout-btn" className="btn btn-secondary btn-sm" onClick={handleLogout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
          {currentUser?.role === 'employer' && (
            <Link to="/employer" className="mobile-link" onClick={() => setMenuOpen(false)}>Find Workers</Link>
          )}
          {currentUser?.role === 'worker' && (
            <Link to="/worker" className="mobile-link" onClick={() => setMenuOpen(false)}>My Dashboard</Link>
          )}
          {!loading && currentUser ? (
            <button className="mobile-link" onClick={handleLogout}>Logout</button>
          ) : !loading ? (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-link" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          ) : null}
        </div>
      )}
    </nav>
  );
}
