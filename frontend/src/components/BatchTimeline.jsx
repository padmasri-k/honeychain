import React from 'react';
import { CheckCircle, MapPin, User, Clock, ShieldCheck, FileText } from 'lucide-react';

export default function BatchTimeline({ events = [] }) {
  const getStageColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'harvested':
        return 'honey';
      case 'tested':
        return 'info';
      case 'processed':
        return 'warning';
      case 'packaged':
        return 'primary';
      case 'distributed':
        return 'success';
      case 'sold':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="batch-timeline">
      {events.length === 0 ? (
        <div className="text-center py-6 text-muted">
          No supply chain checkpoints recorded yet.
        </div>
      ) : (
        events.map((evt, idx) => {
          const color = getStageColor(evt.event_type);
          let details = {};
          try {
            details = typeof evt.details_json === 'string' ? JSON.parse(evt.details_json) : (evt.details_json || {});
          } catch {
            details = {};
          }

          return (
            <div key={evt.id || idx} className="timeline-item">
              <div className={`timeline-badge bg-${color}-light text-${color}`}>
                <CheckCircle size={16} />
              </div>

              <div className="timeline-content card">
                <div className="flex-between">
                  <span className={`badge badge-${color} uppercase text-xs font-bold`}>
                    {evt.event_type}
                  </span>
                  <span className="text-xs text-muted flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-secondary">
                    <User size={12} className="text-muted" />
                    <span>Actor ID: #{evt.actor_id}</span>
                  </div>
                  {evt.location && (
                    <div className="flex items-center gap-1 text-secondary">
                      <MapPin size={12} className="text-muted" />
                      <span>{evt.location}</span>
                    </div>
                  )}
                </div>

                {Object.keys(details).length > 0 && (
                  <div className="timeline-details-box mt-2 p-2 rounded bg-input text-xs">
                    {Object.entries(details).map(([k, v]) => (
                      <div key={k} className="flex justify-between py-0.5">
                        <span className="text-muted capitalize">{k.replace('_', ' ')}:</span>
                        <span className="text-primary font-medium">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {evt.block_hash && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-honey font-mono">
                    <ShieldCheck size={12} />
                    <span>Hash: {evt.block_hash.substring(0, 16)}...</span>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
