import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { Layers, Plus, QrCode, ShieldCheck, Download, Search, AlertCircle } from 'lucide-react';

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    hive_id: '',
    quantity_kg: 25.0,
    moisture_pct: 18.2,
    color_grade: 'Light Amber',
  });

  const fetchData = async () => {
    try {
      const [batchesRes, hivesRes] = await Promise.all([
        client.get('/api/batches'),
        client.get('/api/hives').catch(() => ({ data: [] })),
      ]);
      setBatches(batchesRes.data);
      setHives(hivesRes.data);
      if (hivesRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, hive_id: hivesRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error loading batches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      await client.post('/api/batches', {
        ...formData,
        hive_id: parseInt(formData.hive_id),
        quantity_kg: parseFloat(formData.quantity_kg),
        moisture_pct: parseFloat(formData.moisture_pct),
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Error creating batch: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="page-container">
      <div className="flex-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="text-honey" size={28} />
            Honey Batches & Provenance
          </h1>
          <p className="text-secondary text-sm">
            Traceable production batches linked to immutable cryptographic blocks
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary flex-center gap-2">
          <Plus size={18} />
          <span>Harvest New Batch</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="spinner"></div>
        </div>
      ) : batches.length === 0 ? (
        <div className="card text-center py-12 text-muted">
          No batches found. Click "Harvest New Batch" to record the first honey harvest!
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch Identifier</th>
                  <th>Harvest Date</th>
                  <th>Quantity</th>
                  <th>Moisture</th>
                  <th>Color Grade</th>
                  <th>Status</th>
                  <th>Blockchain & QR</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => {
                  const batchCode = b.batch_code || `BATCH-2026-${String(b.id).padStart(3, '0')}`;
                  return (
                    <tr key={b.id}>
                      <td>
                        <div className="font-mono font-bold text-primary">{batchCode}</div>
                        <div className="text-xs text-muted">Hive #{b.hive_id}</div>
                      </td>
                      <td>{b.harvest_date ? new Date(b.harvest_date).toLocaleDateString() : 'Today'}</td>
                      <td>
                        <span className="font-semibold text-primary">{b.quantity_kg} kg</span>
                      </td>
                      <td>
                        <span
                          className={`font-semibold ${
                            b.moisture_pct <= 20 ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {b.moisture_pct}%
                        </span>
                        <div className="text-xs text-muted">
                          {b.moisture_pct <= 20 ? 'FSSAI compliant' : 'High moisture'}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{b.color_grade || 'Amber'}</span>
                      </td>
                      <td>
                        <span className="badge badge-honey capitalize">{b.status || 'harvested'}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/verify?batch=${batchCode}`}
                            className="btn btn-xs btn-primary flex-center gap-1"
                          >
                            <ShieldCheck size={14} />
                            <span>Verify Ledger</span>
                          </Link>
                          {b.qr_code_url && (
                            <a
                              href={b.qr_code_url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-xs btn-outline"
                              title="Download QR"
                            >
                              <QrCode size={14} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Batch */}
      {showModal && (
        <div className="modal-overlay flex-center">
          <div className="modal-content card" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="modal-header flex-between border-b border-subtle pb-3 mb-4">
              <h3 className="font-bold text-lg">Log New Honey Harvest</h3>
              <button onClick={() => setShowModal(false)} className="btn-close">×</button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Source Hive</label>
                <select
                  className="form-select"
                  value={formData.hive_id}
                  onChange={(e) => setFormData({ ...formData, hive_id: e.target.value })}
                  required
                >
                  {hives.map((h) => (
                    <option key={h.id} value={h.id}>
                      #{h.id} - {h.name} ({h.bee_species})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Quantity Harvested (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={formData.quantity_kg}
                    onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Moisture Content (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={formData.moisture_pct}
                    onChange={(e) => setFormData({ ...formData, moisture_pct: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Color & Floral Grade</label>
                <select
                  className="form-select"
                  value={formData.color_grade}
                  onChange={(e) => setFormData({ ...formData, color_grade: e.target.value })}
                >
                  <option value="Water White">Water White (Acacia / Kashmir White)</option>
                  <option value="Extra White">Extra White (Clover / Litchi)</option>
                  <option value="White">White (Wildflower)</option>
                  <option value="Extra Light Amber">Extra Light Amber (Mustard)</option>
                  <option value="Light Amber">Light Amber (Multifloral)</option>
                  <option value="Amber">Amber (Forest / Sidr)</option>
                  <option value="Dark Amber">Dark Amber (Honeydew / Jamun)</option>
                </select>
              </div>

              <div className="p-3 bg-input rounded text-xs text-secondary">
                ℹ️ Creating this batch automatically mines a <strong>Genesis Block (Block #0)</strong> on the SHA-256 ledger and generates an authenticated QR verification URL.
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-subtle">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Mine Genesis Block & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
