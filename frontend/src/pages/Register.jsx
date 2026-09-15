import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hexagon, Lock, Mail, User, MapPin, Phone, AlertCircle, ArrowRight } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'beekeeper',
    location: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page flex-center">
      <div className="auth-card card" style={{ maxWidth: '480px' }}>
        <div className="auth-header text-center mb-6">
          <div className="brand-logo flex-center mb-2">
            <Hexagon className="icon-honey" size={36} />
          </div>
          <h2 className="text-2xl font-bold">Register on HoneyChain</h2>
          <p className="text-secondary text-sm">Join the transparent honey supply chain ledger</p>
        </div>

        {error && (
          <div className="alert alert-danger flex items-center gap-2 mb-4">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Full Name / Organization</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Ramesh Kumar / Pure Woods Apiary"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Stakeholder Role</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="beekeeper">Beekeeper / Producer</option>
              <option value="processor">Processor & Quality Testing Lab</option>
              <option value="distributor">Logistics & Distributor</option>
              <option value="retailer">Retailer & Store</option>
              <option value="admin">Regulatory Authority / Admin</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Location / State</label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon" />
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="Himachal Pradesh"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full flex-center gap-2">
            {loading ? 'Creating Account...' : 'Register as Node'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer text-center mt-6 text-sm text-secondary">
          Already registered?{' '}
          <Link to="/login" className="text-honey hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
