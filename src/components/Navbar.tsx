"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/assets", label: "Assets", icon: "📦" },
  { href: "/customers", label: "Customers", icon: "👥" },
  { href: "/asset-conditions", label: "Conditions & Values", icon: "📊" },
  { href: "/setup", label: "Setup", icon: "⚙️" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Don't show navbar on auth pages
  if (pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link href="/">🏢 Asset Rental System</Link>
      </div>
      <div className="nav-links">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${pathname === item.href ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
      <div className="nav-user">
        {status === "loading" ? (
          <span className="loading">Loading...</span>
        ) : session?.user ? (
          <>
            <div className="user-info">
              <span className="user-name">{session.user.firstName} {session.user.lastName}</span>
              <span className="agency-name">{session.user.agencyName}</span>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/auth/signin" })} className="logout-btn">
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/auth/signin" className="login-btn">Sign In</Link>
        )}
      </div>

      <style jsx>{`
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          height: 60px;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .nav-brand a {
          color: #ffffff;
          text-decoration: none;
          font-size: 1.25rem;
          font-weight: 700;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .nav-links {
          display: flex;
          gap: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.2s;
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.1);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        .nav-link.active {
          background: rgba(255, 255, 255, 0.35);
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .nav-icon {
          font-size: 1.1rem;
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          color: #ffffff;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .agency-name {
          font-size: 0.75rem;
          opacity: 0.85;
        }

        .logout-btn, .login-btn {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }

        .logout-btn:hover, .login-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .loading {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 0 1rem;
          }
          .nav-label {
            display: none;
          }
          .nav-link {
            padding: 0.5rem;
          }
          .nav-icon {
            font-size: 1.3rem;
          }
          .user-info {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
