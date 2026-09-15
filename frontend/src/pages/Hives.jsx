import React, { useState, useEffect } from 'react';
import client from '../api/client';
import HiveCard from '../components/HiveCard';
import { Box, Plus, Search, Filter, AlertCircle, Sparkles } from 'lucide-react';

export default function Hives() {
  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bee_species: 'Apis cerana',
    flora_source: 'Wildflower & Mustard',
    location_lat: '31.1048',
    location_lng: '77.1734',
    status: 'healthy',
  });

  const fetchHives = async () => {
    try {
      const response = await client.get('/api/hives');
      setHives(response.data);
    } catch (err) {
      console.error('Failed to fetch hives', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHives();
  }, []);

  const handleCreateHive = async (e) => {
    e.preventDefault();
    try {
      await client.post('/api/hives', {
        ...formData,
        location_lat: parseFloat(formData.location_lat),
        location_lng: parseFloat(formData.location_lng),
      });
      setShowModal(false);
      fetchHives();
    } catch (err) {
      alert('Error creating hive: ' + (err.response?.data?.detail || err.message));
    }
  };

  const filteredHives = hives.filter((hive) => {
    const matchesSearch =
      hive.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hive.flora_source?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = filterSpecies === 'all' || hive.bee_species === filterSpecies;
    return matchesSearch && matchesSpecies;
  });

  return (
    <div className="page-container">
      <div className="flex-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Box className="text-honey" size={28} />
            Smart Hive Registry
          </h1>
          <p className="text-secondary text-sm">
            Monitor colony health, GPS geo-tagging, and floral bloom profiles
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary flex-center gap-2">
          <Plus size={18} />
          <span>Register New Hive</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 mb-6 flex-between flex-wrap gap-4">
        <div className="input-with-icon" style={{ maxWidth: '360px', flex: 1 }}>
          <Search size={18} className="input-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search hive name, flora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter size={18} className="text-muted" />
          <select
            className="form-select"
            value={filterSpecies}
            onChange={(e) => setFilterSpecies(e.target.value)}
          >
            <option value="all">All Bee Species</option>
            <option value="Apis cerana">Apis cerana (Indian Hive Bee)</option>
            <option value="Apis mellifera">Apis mellifera (European Bee)</option>
            <option value="Apis dorsata">Apis dorsata (Giant Honey Bee)</option>
            <option value="Trigona iridipennis">Trigona iridipennis (Stingless Bee)</option>
          </select>
        </div>
      </div>

      {/* Hive Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="spinner"></div>
        </div>
      ) : filteredHives.length === 0 ? (
        <div className="card text-center py-12 text-muted">
          No hives match your search criteria. Register a new hive or load seed demo data.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredHives.map((hive) => (
            <HiveCard key={hive.id} hive={hive} />
          ))}
        </div>
      )}

      {/* Modal: Register Hive */}
      {showModal && (
        <div className="modal-overlay flex-center">
          <div className="modal-content card" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="modal-header flex-between border-b border-subtle pb-3 mb-4">
              <h3 className="font-bold text-lg">Register Smart Hive</h3>
              <button onClick={() => setShowModal(false)} className="btn-close">×</button>
            </div>

            <form onSubmit={handleCreateHive} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Hive Name / Identifier</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hive Alpha - Shimla Ridge"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bee Species</label>
                <select
                  className="form-select"
                  value={formData.bee_species}
                  onChange={(e) => setFormData({ ...formData, bee_species: e.target.value })}
                >
                  <option value="Apis cerana">Apis cerana (Indian Hive Bee)</option>
                  <option value="Apis mellifera">Apis mellifera (European Honey Bee)</option>
                  <option value="Apis dorsata">Apis dorsata (Giant Rock Bee)</option>
                  <option value="Trigona iridipennis">Trigona iridipennis (Dammer/Stingless Bee)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Flora / Nectar Source</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Acacia, Mustard, Eucalyptus, Apple Orchard"
                  value={formData.flora_source}
                  onChange={(e) => setFormData({ ...formData, flora_source: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">GPS Latitude</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location_lat}
                    onChange={(e) => setFormData({ ...formData, location_lat: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GPS Longitude</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location_lng}
                    onChange={(e) => setFormData({ ...formData, location_lng: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-subtle">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Hive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
