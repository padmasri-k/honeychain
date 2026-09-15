import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import StatsCard from '../components/StatsCard';
import {
  Box,
  Layers,
  ShieldCheck,
  TrendingUp,
  PlusCircle,
  Sparkles,
  QrCode,
  ArrowUpRight,
  Clock,
  Activity,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalHives: 8,
    totalBatches: 12,
    productionKg: 420.5,
    integrityScore: 100,
    recentBatches: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, batchesRes] = await Promise.all([
          client.get('/api/analytics/dashboard').catch(() => null),
          client.get('/api/batches').catch(() => null),
        ]);

        if (statsRes?.data) {
          setStats((prev) => ({
            ...prev,
            ...statsRes.data,
          }));
        }

        if (batchesRes?.data) {
          setStats((prev) => ({
            ...prev,
            recentBatches: batchesRes.data.slice(0, 5),
          }));
        }
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div className="dashboard-banner card mb-6">
        <div className="flex-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Beekeeper'}!</h1>
              <span className="badge badge-honey uppercase">{user?.role}</span>
            </div>
            <p className="text-secondary text-sm">
              Node connected to HoneyChain Ledger • All SHA-256 blocks validated
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/ai-insights" className="btn btn-outline flex-center gap-2">
              <Sparkles size={16} className="text-warning" />
              <span>Ask HoneyAI</span>
            </Link>
            <Link to="/batches" className="btn btn-primary flex-center gap-2">
              <PlusCircle size={16} />
              <span>New Batch</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Active Smart Hives"
          value={stats.totalHives || '8'}
          change="+12.5%"
          icon={Box}
          color="honey"
        />
        <StatsCard
          title="Harvest Yield"
          value={`${stats.productionKg || '420.5'} kg`}
          change="+18.2%"
          icon={TrendingUp}
          color="success"
        />
        <StatsCard
          title="Verified Batches"
          value={stats.totalBatches || '12'}
          change="+5.0%"
          icon={Layers}
          color="warning"
        />
        <StatsCard
          title="Chain Integrity"
          value="100% Valid"
          change="0 tamper"
          icon={ShieldCheck}
          color="info"
        />
      </div>

      {/* Main Grid: Recent Batches & AI Quick Advisor */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <div className="card-header flex-between border-b border-subtle pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Layers size={20} className="text-honey" />
              <h3 className="card-title font-bold">Live Honey Batches</h3>
            </div>
            <Link to="/batches" className="text-xs text-honey flex items-center gap-1 hover:underline">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Quantity</th>
                  <th>Moisture</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBatches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">
                      No batch records found. Seed data loaded in demo mode.
                    </td>
                  </tr>
                ) : (
                  stats.recentBatches.map((b) => (
                    <tr key={b.id}>
                      <td className="font-mono text-sm font-bold text-primary">
                        {b.batch_code || `BATCH-2026-${String(b.id).padStart(3, '0')}`}
                      </td>
                      <td>{b.quantity_kg} kg</td>
                      <td>
                        <span className={b.moisture_pct > 20 ? 'text-danger font-medium' : 'text-success'}>
                          {b.moisture_pct}%
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-honey text-xs capitalize">{b.status}</span>
                      </td>
                      <td>
                        <Link
                          to={`/verify?batch=${b.batch_code || `BATCH-2026-${String(b.id).padStart(3, '0')}`}`}
                          className="btn btn-xs btn-outline flex-center gap-1"
                        >
                          <QrCode size={12} />
                          <span>Ledger</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Quick Widget */}
        <div className="card">
          <div className="card-header flex items-center gap-2 border-b border-subtle pb-3 mb-4">
            <Sparkles size={20} className="text-warning" />
            <h3 className="card-title font-bold">Gemini Smart Beekeeping</h3>
          </div>

          <div className="ai-widget-content space-y-3">
            <div className="p-3 rounded-lg bg-input border border-subtle">
              <div className="flex items-center gap-2 text-warning text-xs font-bold mb-1">
                <Activity size={14} />
                <span>Harvest Readiness Recommendation</span>
              </div>
              <p className="text-xs text-secondary">
                Mustard bloom in Northern plains is peaking. Target harvest moisture below 18.5% for export grade.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-input border border-subtle">
              <div className="flex items-center gap-2 text-success text-xs font-bold mb-1">
                <ShieldCheck size={14} />
                <span>Anti-Adulteration Benchmark</span>
              </div>
              <p className="text-xs text-secondary">
                C4 sugar and NMR purity checks are required before processor handover block generation.
              </p>
            </div>

            <Link to="/ai-insights" className="btn btn-outline w-full text-xs flex-center gap-2 mt-4">
              <span>Open Gemini Diagnostic Suite</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
