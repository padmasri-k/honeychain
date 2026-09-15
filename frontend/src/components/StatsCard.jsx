import React from 'react';

export default function StatsCard({ title, value, change, icon: Icon, color = 'honey' }) {
  return (
    <div className={`stats-card border-${color}`}>
      <div className="stats-header">
        <span className="stats-title">{title}</span>
        {Icon && (
          <div className={`stats-icon-wrapper text-${color}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
      <div className="stats-value">{value}</div>
      {change && (
        <div className="stats-change">
          <span className={change.startsWith('+') ? 'text-success' : 'text-danger'}>
            {change}
          </span>
          <span className="text-muted ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
}
