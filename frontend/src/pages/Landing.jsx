import React from 'react';
import { Link } from 'react-router-dom';
import {
  Hexagon,
  ShieldCheck,
  Cpu,
  TrendingUp,
  Award,
  QrCode,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pill">SIH 2026 Problem Statement SIH26021</span>
            <span className="badge-text">Ministry of MSME • FoodTech & Agriculture</span>
          </div>

          <h1 className="hero-title">
            Immutable Honey Traceability & <span className="gradient-text">Smart Beekeeping</span>
          </h1>

          <p className="hero-subtitle">
            Combating 77% adulteration in the honey supply chain with SHA-256 cryptographic ledgers,
            QR provenance verification, and Google Gemini AI disease & yield diagnostics.
          </p>

          <div className="hero-cta-group">
            <Link to="/verify" className="btn btn-primary btn-lg flex-center gap-2">
              <QrCode size={20} />
              <span>Verify Honey Batch</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/dashboard" className="btn btn-outline btn-lg flex-center gap-2">
              <Hexagon size={20} className="text-honey" />
              <span>Enter Stakeholder Portal</span>
            </Link>
          </div>

          <div className="hero-stats-banner">
            <div className="stat-pill">
              <span className="stat-pill-val">100%</span>
              <span className="stat-pill-lbl">Tamper-Evident</span>
            </div>
            <div className="stat-pill-divider"></div>
            <div className="stat-pill">
              <span className="stat-pill-val">Gemini AI</span>
              <span className="stat-pill-lbl">Advisory & Diagnostics</span>
            </div>
            <div className="stat-pill-divider"></div>
            <div className="stat-pill">
              <span className="stat-pill-val">End-to-End</span>
              <span className="stat-pill-lbl">Apiary to Retail Shelf</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="features-section">
        <div className="section-header text-center">
          <h2 className="section-title">Engineered for Transparency & Yield</h2>
          <p className="section-sub">
            Built for beekeepers, lab processors, supply distributors, and end-consumers.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card card">
            <div className="feature-icon bg-honey-light text-honey">
              <Lock size={28} />
            </div>
            <h3 className="feature-title">Cryptographic Hash-Chain</h3>
            <p className="feature-desc">
              Every harvest batch, lab purity test, and transit handover creates an SHA-256 block. Any retroactive alteration invalidates all subsequent hashes.
            </p>
          </div>

          <div className="feature-card card">
            <div className="feature-icon bg-warning-light text-warning">
              <Sparkles size={28} />
            </div>
            <h3 className="feature-title">Google Gemini Intelligence</h3>
            <p className="feature-desc">
              AI-driven disease detection (Varroa mite, foulbrood), floral bloom yield forecasting, and automated lab parameter purity score analysis.
            </p>
          </div>

          <div className="feature-card card">
            <div className="feature-icon bg-success-light text-success">
              <QrCode size={28} />
            </div>
            <h3 className="feature-title">Dynamic Jar QR Provenance</h3>
            <p className="feature-desc">
              Consumers scan the unique QR code on the honey jar to view the exact apiary location, harvesting date, beekeeper bio, and laboratory purity certificate.
            </p>
          </div>

          <div className="feature-card card">
            <div className="feature-icon bg-info-light text-info">
              <Cpu size={28} />
            </div>
            <h3 className="feature-title">IoT Smart Hive Registry</h3>
            <p className="feature-desc">
              Track hive GPS coordinates, bee species (Apis cerana, dorsata, mellifera), flora seasonality, and colony health logs in real time.
            </p>
          </div>
        </div>
      </section>

      {/* Verification CTA */}
      <section className="cta-banner card">
        <div className="cta-content flex-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Have a Honey Jar with Batch ID?</h3>
            <p className="text-secondary text-sm">
              Try verifying demo batches like <code>BATCH-2026-001</code> to view its cryptographic ledger and journey.
            </p>
          </div>
          <Link to="/verify?batch=BATCH-2026-001" className="btn btn-primary">
            Test Sample Verification
          </Link>
        </div>
      </section>
    </div>
  );
}
