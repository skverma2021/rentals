"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>Asset Rental System</h1>
        <p>Manage your rental assets, customers, and transactions efficiently</p>
      </div>

      <div className="cards-grid">
        <Link href="/assets" className="card">
          <span className="card-icon">📦</span>
          <h2>Assets</h2>
          <p>Manage rental assets, specifications, and attachments</p>
        </Link>

        <Link href="/customers" className="card">
          <span className="card-icon">👥</span>
          <h2>Customers</h2>
          <p>Manage customers, documents, and rental assignments</p>
        </Link>

        <Link href="/asset-conditions" className="card">
          <span className="card-icon">📊</span>
          <h2>Conditions & Values</h2>
          <p>Track asset conditions and current market values</p>
        </Link>

        <Link href="/setup" className="card">
          <span className="card-icon">⚙️</span>
          <h2>Setup</h2>
          <p>Configure categories, manufacturers, and specifications</p>
        </Link>

        <Link href="/setup/defined-conditions" className="card">
          <span className="card-icon">🏷️</span>
          <h2>Defined Conditions</h2>
          <p>Manage condition types like New, Under Repair, etc.</p>
        </Link>
      </div>

      <style jsx>{`
        .home-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero {
          text-align: center;
          padding: 3rem 0;
        }

        .hero h1 {
          font-size: 2.5rem;
          color: #1e3a8a;
          margin-bottom: 0.5rem;
        }

        .hero p {
          color: #64748b;
          font-size: 1.1rem;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.2s;
          border: 2px solid transparent;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border-color: #3b82f6;
        }

        .card-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 0.75rem;
        }

        .card h2 {
          color: #1a1a1a;
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
        }

        .card p {
          color: #64748b;
          font-size: 0.9rem;
          margin: 0;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
