import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-icon">K</div>
        <div>
          <h1 className="app-title">Kolpar</h1>
          <p className="app-subtitle">Browser-only CSV column cleaner</p>
        </div>
      </div>
      <div className="privacy-badge" title="Files are processed entirely in your browser">
        <svg
          className="badge-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>100% Client-Side • Zero Uploads</span>
      </div>
    </header>
  );
};
