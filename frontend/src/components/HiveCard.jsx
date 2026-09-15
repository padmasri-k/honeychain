import React from 'react';
import { Box, MapPin, Activity, Calendar, ShieldAlert } from 'lucide-react';

export default function HiveCard({ hive, onInspect }) {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return <span className="badge badge-success">Healthy</span>;
      case 'warning':
        return <span className="badge badge-warning">Attention Needed</span>;
      case 'quarantine':
        return <span className="badge badge-danger">Quarantined</span>;
      default:
        return <span className="badge badge-info">{status || 'Active'}</span>;
    }
  };

  return (
    <div className="hive-card card">
      <div className="card-header flex-between">
        <div className="flex items-center gap-2">
          <Box className="text-honey" size={20} />
          <h3 className="card-title font-bold">{hive.name}</h3>
        </div>
        {getStatusBadge(hive.status)}
      </div>

      <div className="card-body">
        <div className="hive-detail-row">
          <span className="text-muted flex items-center gap-1">
            <Activity size={14} /> Species:
          </span>
          <span className="font-medium text-primary">{hive.bee_species || 'Apis cerana'}</span>
        </div>

        <div className="hive-detail-row">
          <span className="text-muted flex items-center gap-1">
            <MapPin size={14} /> Flora Source:
          </span>
          <span className="font-medium text-primary">{hive.flora_source || 'Mustard & Wildflower'}</span>
        </div>

        <div className="hive-detail-row">
          <span className="text-muted flex items-center gap-1">
            <Calendar size={14} /> Registered:
          </span>
          <span className="font-medium text-primary">
            {hive.registered_at ? new Date(hive.registered_at).toLocaleDateString() : 'N/A'}
          </span>
        </div>

        {hive.location_lat && hive.location_lng && (
          <div className="hive-coordinates">
            GPS: {Number(hive.location_lat).toFixed(4)}° N, {Number(hive.location_lng).toFixed(4)}° E
          </div>
        )}
      </div>

      <div className="card-footer flex-between mt-3 pt-3 border-t border-subtle">
        <span className="text-xs text-muted">Hive ID: #{hive.id}</span>
        {onInspect && (
          <button onClick={() => onInspect(hive)} className="btn btn-sm btn-outline">
            AI Diagnosis
          </button>
        )}
      </div>
    </div>
  );
}
