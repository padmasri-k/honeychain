import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hexagon, LogOut, User, ShieldCheck, Sparkles, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo">
            <Hexagon className="icon-honey pulse" size={28} />
            <span className="brand-badge">SIH26</span>
          </div>
          <div className="brand-text">
            <span className="brand-name">Honey<span className="text-honey">Chain</span></span>
            <span className="brand-sub">Trust & Traceability</span>
          </div>
        </Link>

        <nav className="navbar-nav">
          <Link to="/verify" className="nav-link flex-center gap-2">
            <ShieldCheck size={18} className="text-honey" />
            <span>Verify Honey</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link flex-center gap-2">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link to="/ai-insights" className="nav-link flex-center gap-2">
                <Sparkles size={18} className="text-warning" />
                <span>AI Advisory</span>
              </Link>
              <div className="navbar-user">
                <div className="user-badge">
                  <User size={16} />
                  <span>{user?.name || user?.email}</span>
                  <span className="role-tag">{user?.role}</span>
                </div>
                <button onClick={handleLogout} className="btn-icon" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-actions">
              <Link to="/login" className="btn btn-outline">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
