import React, { useState, useEffect } from 'react';
import client from '../api/client';
import BatchTimeline from '../components/BatchTimeline';
import { Truck, Plus, CheckCircle, Search, Layers, ShieldCheck, MapPin } from 'lucide-react';

export default function SupplyChain() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    event_type: 'tested',
    location: 'Shimla Quality Testing Lab, HP',
    details: {
      lab_name: 'National Bee Board Certified Lab',
      hsv_purity: 'Passed (99.2%)',
      c4_sugar: 'Negative (Adulteration Free)',
      fructose_glucose_ratio: '1.18',
    },
  });

  const fetchBatches = async () => {
    try {
      const res = await client.get('/api/batches');
      setBatches(res.data);
      if (res.data.length > 0) {
        setSelectedBatch(res.data[0]);
        loadEvents(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async (batchId) => {
    try {
      const res = await client.get(`/api/supply-chain/batch/${batchId}`);
      setEvents(res.data);
    } catch (err) {
      console.error('Error loading events', err);
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleSelectBatch = (batch) => {
    setSelectedBatch(batch);
    loadEvents(batch.id);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;

    try {
      await client.post('/api/supply-chain/event', {
        batch_id: selectedBatch.id,
        event_type: newEvent.event_type,
        location: newEvent.location,
        details_json: JSON.stringify(newEvent.details),
      });

      setShowModal(false);
      loadEvents(selectedBatch.id);
    } catch (err) {
      alert('Failed to log event: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="page-container">
      <div className="flex-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="text-honey" size={28} />
            Supply Chain & Custody Ledger
          </h1>
          <p className="text-secondary text-sm">
            Record verified transitions across processors, cold-chains, and retailers
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={!selectedBatch}
          className="btn btn-primary flex-center gap-2"
        >
          <Plus size={18} />
          <span>Log Supply Chain Step</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Batch Selector */}
        <div className="card">
          <h3 className="font-bold text-sm text-secondary mb-3 flex items-center gap-2">
            <Layers size={16} /> Select Production Batch
          </h3>

          <div className="batch-selection-list space-y-2">
            {batches.map((b) => {
              const batchCode = b.batch_code || `BATCH-2026-${String(b.id).padStart(3, '0')}`;
              const isSelected = selectedBatch?.id === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => handleSelectBatch(b)}
                  className={`p-3 rounded-lg cursor-pointer transition border ${
                    isSelected
                      ? 'bg-honey-500/10 border-honey'
                      : 'bg-input border-subtle hover:border-honey/40'
                  }`}
                >
                  <div className="flex-between">
                    <span className="font-mono font-bold text-sm text-primary">{batchCode}</span>
                    <span className="badge badge-honey text-xs capitalize">{b.status}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted mt-1">
                    <span>{b.quantity_kg} kg</span>
                    <span>Moisture: {b.moisture_pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Supply Chain Timeline */}
        <div className="col-span-2 card">
          <div className="card-header flex-between border-b border-subtle pb-3 mb-4">
            <div>
              <h3 className="font-bold text-base">
                Audit Trail for{' '}
                <span className="text-honey font-mono">
                  {selectedBatch?.batch_code || `BATCH-2026-${String(selectedBatch?.id || 0).padStart(3, '0')}`}
                </span>
              </h3>
              <p className="text-xs text-muted">
                Each event below triggers cryptographic hashing and block mining.
              </p>
            </div>
            <span className="badge badge-success text-xs flex items-center gap-1">
              <ShieldCheck size={14} /> Immutable Trail
            </span>
          </div>

          <BatchTimeline events={events} />
        </div>
      </div>

      {/* Modal: Log Event */}
      {showModal && (
        <div className="modal-overlay flex-center">
          <div className="modal-content card" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="modal-header flex-between border-b border-subtle pb-3 mb-4">
              <h3 className="font-bold text-lg">Record Custody Handover</h3>
              <button onClick={() => setShowModal(false)} className="btn-close">×</button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Supply Chain Stage</label>
                <select
                  className="form-select"
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                >
                  <option value="tested">Laboratory Quality & Purity Test</option>
                  <option value="processed">Centrifugal Extraction & Settling</option>
                  <option value="packaged">Sterilized Jar Packaging & Sealing</option>
                  <option value="distributed">Cold-Chain Logistics Handover</option>
                  <option value="sold">Retail Outlet Shelf Placement</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Facility</label>
                <input
                  type="text"
                  className="form-input"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  required
                />
              </div>

              <div className="p-3 bg-input rounded text-xs text-secondary">
                🔒 Submitting this event will generate an SHA-256 block anchored to the previous block hash in batch #{selectedBatch?.id}.
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-subtle">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Mine Block & Record Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
