import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hexagon, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('ramesh@apiary.in');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const setDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="auth-page flex-center">
      <div className="auth-card card">
        <div className="auth-header text-center mb-6">
          <div className="brand-logo flex-center mb-2">
            <Hexagon className="icon-honey" size={36} />
          </div>
          <h2 className="text-2xl font-bold">Welcome to HoneyChain</h2>
          <p className="text-secondary text-sm">Sign in to your stakeholder ledger node</p>
        </div>

        {error && (
          <div className="alert alert-danger flex items-center gap-2 mb-4">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full flex-center gap-2">
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="demo-accounts-box mt-6 pt-4 border-t border-subtle">
          <span className="text-xs text-muted block mb-2 font-medium">Quick Demo Logins:</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={() => setDemoAccount('ramesh@apiary.in')}
            >
              🐝 Beekeeper
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={() => setDemoAccount('priya@purehoneylab.in')}
            >
              🧪 Processor/Lab
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={() => setDemoAccount('vikram@agrilogistics.in')}
            >
              🚚 Distributor
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={() => setDemoAccount('admin@honeychain.gov.in')}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        <div className="auth-footer text-center mt-6 text-sm text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="text-honey hover:underline">
            Register Stakeholder
          </Link>
        </div>
      </div>
    </div>
  );
}
