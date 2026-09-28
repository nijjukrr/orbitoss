import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/shared/ErrorBoundary.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { IntroExperience } from './components/intro/IntroExperience.jsx';

import { DashboardPage } from './pages/DashboardPage.jsx';
import { SatellitesPage } from './pages/SatellitesPage.jsx';
import { StationPage } from './pages/StationPage.jsx';
import { CrewPage } from './pages/CrewPage.jsx';
import { ExperimentsPage } from './pages/ExperimentsPage.jsx';
import { GroundStationsPage } from './pages/GroundStationsPage.jsx';
import { CommandCenterPage } from './pages/CommandCenterPage.jsx';
import { AlertsPage } from './pages/AlertsPage.jsx';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('orbitops-theme') || 'dark';
  });
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedSatelliteCode, setSelectedSatelliteCode] = useState('SAT-01');
  const [notification, setNotification] = useState('');

  // Synchronize document data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('orbitops-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSelectSatellite = (code) => {
    setSelectedSatelliteCode(code);
    setActiveTab(`Satellite:${code}`);
  };

  const handleEmergencyTriggered = (msg) => {
    setNotification(`⚡ ${msg}`);
    setTimeout(() => setNotification(''), 6000);
  };

  let pageContent = null;
  if (activeTab === 'Dashboard') {
    pageContent = (
      <DashboardPage
        onSelectSatellite={handleSelectSatellite}
        onSelectTab={setActiveTab}
        onEmergencyTriggered={handleEmergencyTriggered}
      />
    );
  } else if (activeTab === 'Satellites' || activeTab.startsWith('Satellite:')) {
    const code = activeTab.startsWith('Satellite:') ? activeTab.split(':')[1] : selectedSatelliteCode;
    pageContent = <SatellitesPage code={code} onSelectSatellite={handleSelectSatellite} />;
  } else if (activeTab === 'Station') {
    pageContent = <StationPage />;
  } else if (activeTab === 'Crew') {
    pageContent = <CrewPage />;
  } else if (activeTab === 'Experiments') {
    pageContent = <ExperimentsPage />;
  } else if (activeTab === 'Ground Stations') {
    pageContent = <GroundStationsPage />;
  } else if (activeTab === 'Command Center') {
    pageContent = <CommandCenterPage />;
  } else if (activeTab === 'Alerts') {
    pageContent = <AlertsPage onEmergencyTriggered={handleEmergencyTriggered} />;
  } else {
    pageContent = (
      <DashboardPage
        onSelectSatellite={handleSelectSatellite}
        onSelectTab={setActiveTab}
        onEmergencyTriggered={handleEmergencyTriggered}
      />
    );
  }

  return (
    <ErrorBoundary>
      {/* Intro Experience Overlay */}
      {showIntro && (
        <IntroExperience onEnter={() => setShowIntro(false)} />
      )}

      {/* Main Mission Control Application */}
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: 'var(--page-bg)',
          color: 'var(--text-primary)',
          fontFamily: 'Manrope, system-ui, sans-serif',
          opacity: showIntro ? 0 : 1,
          transform: showIntro ? 'scale(0.97)' : 'scale(1)',
          transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Content Region */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Top Header Navbar */}
          <Navbar
            activeTab={activeTab}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />

          {/* Emergency Trigger Toast Notification */}
          {notification && (
            <div style={{
              background: 'var(--surface-muted)',
              borderBottom: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              padding: '0.75rem 2rem',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              animation: 'fadeIn 0.3s ease'
            }}>
              <span>{notification}</span>
              <button
                onClick={() => setNotification('')}
                aria-label="Dismiss notification"
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Active Page Body */}
          <main style={{ padding: '2rem', maxWidth: '1600px', width: '100%', margin: '0 auto', flex: 1 }}>
            {pageContent}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}


