import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Hives from './pages/Hives';
import Batches from './pages/Batches';
import SupplyChain from './pages/SupplyChain';
import Verify from './pages/Verify';
import AIInsights from './pages/AIInsights';
import Analytics from './pages/Analytics';

function AppLayout({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isPublicPage = ['/', '/login', '/register', '/verify'].includes(location.pathname);

  const showSidebar = isAuthenticated && !isPublicPage;

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-layout">
        {showSidebar && <Sidebar />}
        <main className={`content-area ${showSidebar ? 'content-with-sidebar' : 'content-full'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/hives" element={<Hives />} />
              <Route path="/batches" element={<Batches />} />
              <Route path="/supply-chain" element={<SupplyChain />} />
              <Route path="/ai-insights" element={<AIInsights />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
