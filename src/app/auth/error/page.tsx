"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "Your email is not authorized to access this system. Please contact your agency administrator.",
    Verification: "The verification link has expired or has already been used.",
    Default: "An error occurred during authentication.",
  };

  const message = errorMessages[error || "Default"] || errorMessages.Default;

  return (
    <div className="error-page">
      <div className="error-card">
        <div className="icon">⚠️</div>
        <h1>Authentication Error</h1>
        <p className="message">{message}</p>
        <Link href="/auth/signin" className="back-btn">
          Try Again
        </Link>
      </div>

      <style jsx>{`
        .error-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          padding: 1rem;
        }
        .error-card {
          background: white;
          border-radius: 16px;
          padding: 3rem;
          max-width: 400px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        h1 {
          font-size: 1.5rem;
          color: #1e293b;
          margin: 0 0 1rem 0;
        }
        .message {
          color: #64748b;
          margin: 0 0 2rem 0;
          line-height: 1.6;
        }
        .back-btn {
          display: inline-block;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 0.875rem 2rem;
          border-radius: 8px;
          font-weight: 500;
          transition: background 0.2s;
        }
        .back-btn:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
