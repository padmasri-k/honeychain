import React, { useState, useEffect } from 'react';
import client from '../api/client';
import StatsCard from '../components/StatsCard';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Percent,
  Layers,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export default function Analytics() {
  const [data, setData] = useState({
    regionalYield: [
      { region: 'Himachal Pradesh', yield: 185, quality: 99.1 },
      { region: 'Uttarakhand', yield: 140, quality: 98.4 },
      { region: 'Kashmir', yield: 95, quality: 99.8 },
      { region: 'Punjab', yield: 120, quality: 96.5 },
      { region: 'Rajasthan', yield: 80, quality: 97.2 },
    ],
    varietyShare: [
      { name: 'Mustard Honey', value: 35, color: '#f59e0b' },
      { name: 'Acacia (White)', value: 25, color: '#fbbf24' },
      { name: 'Multifloral Forest', value: 20, color: '#d97706' },
      { name: 'Sidr / Ber', value: 12, color: '#b45309' },
      { name: 'Litchi Honey', value: 8, color: '#78350f' },
    ],
    monthlyTrend: [
      { month: 'Apr', yieldKg: 28 },
      { month: 'May', yieldKg: 45 },
      { month: 'Jun', yieldKg: 38 },
      { month: 'Jul', yieldKg: 52 },
      { month: 'Aug', yieldKg: 68 },
      { month: 'Sep', yieldKg: 92 },
    ],
  });

  return (
    <div className="page-container">
      <div className="flex-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="text-honey" size={28} />
            Honey Industry & Provenance Analytics
          </h1>
          <p className="text-secondary text-sm">
            Aggregate yield metrics, geographic traceability, and anti-adulteration scoreboards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-success flex items-center gap-1">
            <ShieldCheck size={14} /> FSSAI Benchmark Compliant
          </span>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Ledger Volume"
          value="1,420 kg"
          change="+24.2%"
          icon={Layers}
          color="honey"
        />
        <StatsCard
          title="Average Authenticity Index"
          value="98.7%"
          change="+1.5%"
          icon={Award}
          color="success"
        />
        <StatsCard
          title="Monitored Apiaries"
          value="34"
          change="+4"
          icon={MapPin}
          color="warning"
        />
        <StatsCard
          title="Zero-Adulteration Batches"
          value="100%"
          change="Audit Verified"
          icon={ShieldCheck}
          color="info"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Regional Production */}
        <div className="card">
          <h3 className="card-title font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-honey" />
            Regional Yield Output (kg)
          </h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.regionalYield}>
                <XAxis dataKey="region" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#f59e0b',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="yield" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Floral Variety Distribution */}
        <div className="card">
          <h3 className="card-title font-bold mb-4 flex items-center gap-2">
            <Percent size={18} className="text-honey" />
            Floral Variety & Nectar Share (%)
          </h3>
          <div style={{ height: 260 }} className="flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={data.varietyShare}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {data.varietyShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="variety-legend space-y-2 text-xs">
              {data.varietyShare.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-secondary">{item.name}</span>
                  <span className="font-bold text-primary">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Production Trend Line Chart */}
      <div className="card">
        <h3 className="card-title font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-success" />
          6-Month Harvest Velocity & Bloom Tracking
        </h3>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlyTrend}>
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#10b981',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="yieldKg"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
