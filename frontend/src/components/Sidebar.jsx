import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Box,
  Layers,
  Truck,
  Sparkles,
  BarChart3,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'beekeeper';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/hives', label: 'Smart Hives', icon: Box, roles: ['beekeeper', 'admin'] },
    { to: '/batches', label: 'Honey Batches', icon: Layers, roles: ['beekeeper', 'processor', 'admin'] },
    { to: '/supply-chain', label: 'Supply Chain', icon: Truck, roles: ['beekeeper', 'processor', 'distributor', 'retailer', 'admin'] },
    { to: '/ai-insights', label: 'AI Advisor', icon: Sparkles },
    { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'processor', 'beekeeper'] },
    { to: '/verify', label: 'Public Verification', icon: ShieldCheck },
  ];

  const filteredItems = navItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <aside className="sidebar">
      <div className="sidebar-role-indicator">
        <span className="dot dot-active"></span>
        <div className="role-meta">
          <span className="role-title">{role.toUpperCase()} PORTAL</span>
          <span className="role-status">Active Node</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="sidebar-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status-card">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-success" />
            <span className="text-xs text-muted">Ledger Synchronized</span>
          </div>
          <div className="text-xs text-secondary mt-1">Hash-Chain v1.0 • SHA-256</div>
        </div>
      </div>
    </aside>
  );
}
