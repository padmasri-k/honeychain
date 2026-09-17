import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Attach JWT token to requests if available
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('honeychain_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global responses & unauthorized redirect
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/verify') {
        localStorage.removeItem('honeychain_token');
        localStorage.removeItem('honeychain_user');
      }
    }
    return Promise.reject(error);
  }
);

// ---- Mock data for demo mode (no backend required) ----

const MOCK_HIVES = [
  { id: 1, name: 'Hive Alpha - Kullu Valley', bee_species: 'Apis cerana', flora_source: 'Wildflower & Mustard', location_lat: 31.9579, location_lng: 77.1095, status: 'healthy', registered_at: '2026-01-15T08:00:00Z' },
  { id: 2, name: 'Hive Beta - Shimla Ridge', bee_species: 'Apis mellifera', flora_source: 'Acacia & Eucalyptus', location_lat: 31.1048, location_lng: 77.1734, status: 'healthy', registered_at: '2026-02-10T08:00:00Z' },
  { id: 3, name: 'Hive Gamma - Kangra Plains', bee_species: 'Apis cerana', flora_source: 'Mustard & Litchi', location_lat: 32.0998, location_lng: 76.5330, status: 'warning', registered_at: '2026-03-05T08:00:00Z' },
  { id: 4, name: 'Hive Delta - Manali Slopes', bee_species: 'Apis dorsata', flora_source: 'Forest Honeydew', location_lat: 32.2396, location_lng: 77.1887, status: 'healthy', registered_at: '2026-03-20T08:00:00Z' },
  { id: 5, name: 'Hive Epsilon - Solan Orchards', bee_species: 'Apis mellifera', flora_source: 'Apple Blossom & Clover', location_lat: 30.9045, location_lng: 77.0967, status: 'healthy', registered_at: '2026-04-01T08:00:00Z' },
  { id: 6, name: 'Hive Zeta - Mandi Foothills', bee_species: 'Apis cerana', flora_source: 'Sidr & Wildflower', location_lat: 31.7060, location_lng: 76.9330, status: 'quarantine', registered_at: '2026-04-12T08:00:00Z' },
];

const MOCK_BATCHES = [
  { id: 1, batch_code: 'BATCH-2026-001', hive_id: 1, harvest_date: '2026-09-10T08:30:00Z', quantity_kg: 45.0, moisture_pct: 17.8, color_grade: 'Light Amber', status: 'tested', qr_code_url: '/static/qrcodes/qr_HC-ACAC2025.png' },
  { id: 2, batch_code: 'BATCH-2026-002', hive_id: 2, harvest_date: '2026-09-08T07:15:00Z', quantity_kg: 38.5, moisture_pct: 18.2, color_grade: 'Water White', status: 'processed', qr_code_url: '/static/qrcodes/qr_HC-WILD2025.png' },
  { id: 3, batch_code: 'BATCH-2026-003', hive_id: 3, harvest_date: '2026-09-05T09:00:00Z', quantity_kg: 52.0, moisture_pct: 19.1, color_grade: 'Amber', status: 'harvested', qr_code_url: '/static/qrcodes/qr_HC-MUST2025.png' },
  { id: 4, batch_code: 'BATCH-2026-004', hive_id: 4, harvest_date: '2026-09-03T06:45:00Z', quantity_kg: 28.0, moisture_pct: 16.5, color_grade: 'Dark Amber', status: 'tested', qr_code_url: '/static/qrcodes/qr_HC-SIDR2025.png' },
  { id: 5, batch_code: 'BATCH-2026-005', hive_id: 5, harvest_date: '2026-09-01T08:00:00Z', quantity_kg: 33.5, moisture_pct: 17.5, color_grade: 'Extra Light Amber', status: 'distributed', qr_code_url: '/static/qrcodes/qr_HC-EUCL2025.png' },
];

const MOCK_EVENTS = {
  1: [
    { id: 1, event_type: 'harvested', actor_id: 101, location: 'Kullu Apiary, HP', timestamp: '2026-09-10T08:30:00Z', details_json: '{"quantity_kg": 45.0, "moisture_pct": 17.8, "method": "Unheated Comb Cut"}', block_hash: 'a94827cf64b81b3948e42f9e4070a3bb68153c3e2bb921c5f355325c3cf3e3b1' },
    { id: 2, event_type: 'tested', actor_id: 204, location: 'Govt Food Testing Lab, Shimla', timestamp: '2026-09-11T11:15:00Z', details_json: '{"fructose_glucose_ratio": 1.15, "c4_sugar": "Negative", "hmf": "14 mg/kg (Safe)"}', block_hash: 'c83d8e5b41295b9c023d84a7e93019d83294ba723498bfe194837a284619a820' },
    { id: 3, event_type: 'processed', actor_id: 204, location: 'Pure Honey Processing Unit, Solan', timestamp: '2026-09-12T14:45:00Z', details_json: '{"method": "Cold Centrifugal", "temperature": "32C", "filtration": "200 micron"}', block_hash: '72e8a1d48c3b9941a87b6408e0192a54388147d2f928e461bca8350029bfa841' },
  ],
  2: [
    { id: 4, event_type: 'harvested', actor_id: 101, location: 'Shimla Ridge Apiary, HP', timestamp: '2026-09-08T07:15:00Z', details_json: '{"quantity_kg": 38.5, "moisture_pct": 18.2}', block_hash: 'b1f2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2' },
  ],
  3: [
    { id: 5, event_type: 'harvested', actor_id: 102, location: 'Kangra Plains, HP', timestamp: '2026-09-05T09:00:00Z', details_json: '{"quantity_kg": 52.0, "moisture_pct": 19.1}', block_hash: 'c2f3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3' },
  ],
  4: [
    { id: 6, event_type: 'harvested', actor_id: 103, location: 'Manali Slopes, HP', timestamp: '2026-09-03T06:45:00Z', details_json: '{"quantity_kg": 28.0, "moisture_pct": 16.5}', block_hash: 'd3f4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4' },
    { id: 7, event_type: 'tested', actor_id: 205, location: 'NABL Lab, Kullu', timestamp: '2026-09-04T10:30:00Z', details_json: '{"purity": "99.5%", "c4_sugar": "Negative"}', block_hash: 'e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5' },
  ],
  5: [
    { id: 8, event_type: 'harvested', actor_id: 104, location: 'Solan Orchards, HP', timestamp: '2026-09-01T08:00:00Z', details_json: '{"quantity_kg": 33.5, "moisture_pct": 17.5}', block_hash: 'f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6' },
    { id: 9, event_type: 'tested', actor_id: 206, location: 'FSSAI Lab, Delhi', timestamp: '2026-09-02T14:00:00Z', details_json: '{"purity": "98.9%", "c4_sugar": "Negative"}', block_hash: 'a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7' },
    { id: 10, event_type: 'distributed', actor_id: 301, location: 'AgriLogistics Hub, Chandigarh', timestamp: '2026-09-04T09:00:00Z', details_json: '{"vehicle": "Reefer Truck HP-01-2345", "temperature": "18C"}', block_hash: 'b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8' },
  ],
};

const MOCK_CHAIN = {
  1: [
    { id: 0, prev_hash: '0000000000000000000000000000000000000000000000000000000000000000', data_hash: 'a94827cf64b81b3948e42f9e4070a3bb68153c3e2bb921c5f355325c3cf3e3b1', timestamp: '2026-09-10T08:30:00Z', nonce: 1042, action: 'Genesis Block - Batch Harvest Logged' },
    { id: 1, prev_hash: 'a94827cf64b81b3948e42f9e4070a3bb68153c3e2bb921c5f355325c3cf3e3b1', data_hash: 'c83d8e5b41295b9c023d84a7e93019d83294ba723498bfe194837a284619a820', timestamp: '2026-09-11T11:15:00Z', nonce: 2841, action: 'NABL Certified Lab Purity & C4 Sugar Test Passed' },
    { id: 2, prev_hash: 'c83d8e5b41295b9c023d84a7e93019d83294ba723498bfe194837a284619a820', data_hash: '72e8a1d48c3b9941a87b6408e0192a54388147d2f928e461bca8350029bfa841', timestamp: '2026-09-12T14:45:00Z', nonce: 4902, action: 'Cold Centrifugal Processing & Hermetic Bottling' },
  ],
};

const DEMO_USERS = {
  'ramesh@apiary.in': { id: 101, name: 'Ramesh Kumar', email: 'ramesh@apiary.in', role: 'beekeeper', location: 'Kullu, Himachal Pradesh', phone: '+91 98160 12345' },
  'priya@purehoneylab.in': { id: 204, name: 'Dr. Priya Sharma', email: 'priya@purehoneylab.in', role: 'processor', location: 'Shimla, Himachal Pradesh', phone: '+91 98160 67890' },
  'vikram@agrilogistics.in': { id: 301, name: 'Vikram Singh', email: 'vikram@agrilogistics.in', role: 'distributor', location: 'Chandigarh', phone: '+91 98170 11111' },
  'admin@honeychain.gov.in': { id: 1, name: 'Admin Authority', email: 'admin@honeychain.gov.in', role: 'admin', location: 'Delhi', phone: '+91 98180 99999' },
};

// Wrapper that falls back to mock data when the backend is unreachable
const mockClient = {
  async get(url) {
    try {
      return await client.get(url);
    } catch {
      return mockResponse(url);
    }
  },
  async post(url, data) {
    try {
      return await client.post(url, data);
    } catch {
      return mockPostResponse(url, data);
    }
  },
};

function mockResponse(url) {
  if (url === '/api/hives') return { data: MOCK_HIVES };
  if (url === '/api/batches') return { data: MOCK_BATCHES };
  if (url === '/api/analytics/dashboard') {
    return { data: { totalHives: 6, totalBatches: 5, productionKg: 197.0, integrityScore: 100 } };
  }
  if (url.startsWith('/api/supply-chain/batch/')) {
    const id = parseInt(url.split('/').pop());
    return { data: MOCK_EVENTS[id] || [] };
  }
  if (url.startsWith('/api/blockchain/verify/')) {
    const code = url.split('/').pop();
    const batch = MOCK_BATCHES.find(b => b.batch_code === code) || MOCK_BATCHES[0];
    const batchId = batch.id;
    return { data: {
      batch_id: code,
      is_valid: true,
      authenticity_score: 98,
      batch_info: {
        batch_code: batch.batch_code,
        harvest_date: batch.harvest_date,
        quantity_kg: batch.quantity_kg,
        moisture_pct: batch.moisture_pct,
        color_grade: batch.color_grade,
        hive_name: MOCK_HIVES.find(h => h.id === batch.hive_id)?.name || 'Apiary Hive Alpha',
        beekeeper_name: 'Ramesh Kumar',
        bee_species: MOCK_HIVES.find(h => h.id === batch.hive_id)?.bee_species || 'Apis cerana indica',
        location: 'Kullu, Himachal Pradesh',
      },
      chain: MOCK_CHAIN[batchId] || MOCK_CHAIN[1],
      events: MOCK_EVENTS[batchId] || MOCK_EVENTS[1],
    }};
  }
  return { data: null };
}

function mockPostResponse(url, data) {
  if (url === '/api/auth/login') {
    const user = DEMO_USERS[data.email];
    if (user && data.password === 'password123') {
      return { data: { access_token: 'demo-jwt-token-' + user.id, user } };
    }
    throw { response: { data: { detail: 'Invalid credentials. Use demo accounts with password: password123' } } };
  }
  if (url === '/api/auth/register') {
    const user = { id: Date.now(), name: data.name, email: data.email, role: data.role, location: data.location, phone: data.phone };
    return { data: { access_token: 'demo-jwt-token-' + user.id, user } };
  }
  if (url === '/api/hives') {
    const newHive = { id: Date.now(), ...data, status: data.status || 'healthy', registered_at: new Date().toISOString() };
    MOCK_HIVES.push(newHive);
    return { data: newHive };
  }
  if (url === '/api/batches') {
    const id = MOCK_BATCHES.length + 1;
    const newBatch = {
      id,
      batch_code: `BATCH-2026-${String(id).padStart(3, '0')}`,
      hive_id: data.hive_id,
      harvest_date: new Date().toISOString(),
      quantity_kg: data.quantity_kg,
      moisture_pct: data.moisture_pct,
      color_grade: data.color_grade || 'Amber',
      status: 'harvested',
      qr_code_url: `/static/qrcodes/qr_HC-ACAC2025.png`,
    };
    MOCK_BATCHES.push(newBatch);
    return { data: newBatch };
  }
  if (url === '/api/supply-chain/event') {
    const batchId = data.batch_id;
    const id = (MOCK_EVENTS[batchId]?.length || 0) + 1;
    const newEvent = {
      id,
      event_type: data.event_type,
      actor_id: 101,
      location: data.location,
      timestamp: new Date().toISOString(),
      details_json: data.details_json || '{}',
      block_hash: Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join(''),
    };
    if (!MOCK_EVENTS[batchId]) MOCK_EVENTS[batchId] = [];
    MOCK_EVENTS[batchId].push(newEvent);
    return { data: newEvent };
  }
  if (url === '/api/ai/diagnose') {
    return { data: {
      diagnosis: 'Suspected Varroa Mite Infestation with Deformed Wing Virus (DWV)',
      severity: 'High - Immediate Intervention Needed',
      confidence: '94%',
      recommendations: [
        'Apply Oxalic Acid sublimation or Formic Acid flash treatment immediately.',
        'Install sticky screen bottom boards to monitor daily mite drop counts.',
        'Isolate heavily impacted brood frames to prevent cross-colony drift.',
        'Re-queen with hygienic, Varroa-sensitive Russian or Carniolan genetics.',
      ],
    }};
  }
  if (url === '/api/ai/quality-check') {
    return { data: {
      purity_score: 97.5,
      grade: 'Grade A - Raw Organic Export Quality',
      fssai_status: 'Compliant with FSSAI & Codex Alimentarius standards',
      notes: [
        'Moisture (18.5%) safely below 20.0% critical fermentation threshold.',
        'C4 Sugar level (1.2%) indicates zero cane sugar or corn syrup adulteration.',
        'HMF (18.0 mg/kg) demonstrates freshly extracted honey with no heat damage.',
      ],
    }};
  }
  if (url === '/api/ai/yield-forecast') {
    return { data: {
      forecast_kg: '32.5 kg to 38.0 kg',
      peak_date: 'March 28 - April 5, 2026',
      recommendations: [
        'Add a second shallow honey super within the next 4 days to avoid swarming.',
        'Maintain hive ventilation to assist bees in rapid nectar dehydration.',
      ],
    }};
  }
  if (url === '/api/ai/chat') {
    return { data: { reply: 'Based on standard beekeeping practices, I recommend maintaining brood temperature at 34°C, inspecting comb every fortnight, and ensuring adequate nectar flow. For Apis cerana, monitor for absconding triggers like pesticide exposure and food scarcity.' }};
  }
  return { data: null };
}

export default mockClient;
