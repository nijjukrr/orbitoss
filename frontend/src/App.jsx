import React, { useState } from 'react';
import { ErrorBoundary } from './components/shared/ErrorBoundary.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { Navbar } from './components/layout/Navbar.jsx';

import { DashboardPage } from './pages/DashboardPage.jsx';
import { SatellitesPage } from './pages/SatellitesPage.jsx';
import { StationPage } from './pages/StationPage.jsx';
import { CrewPage } from './pages/CrewPage.jsx';
import { ExperimentsPage } from './pages/ExperimentsPage.jsx';
import { GroundStationsPage } from './pages/GroundStationsPage.jsx';
import { CommandCenterPage } from './pages/CommandCenterPage.jsx';
import { AlertsPage } from './pages/AlertsPage.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedSatelliteCode, setSelectedSatelliteCode] = useState('SAT-01');
  const [notification, setNotification] = useState('');

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
    pageContent = <DashboardPage onSelectSatellite={handleSelectSatellite} onSelectTab={setActiveTab} />;
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
    pageContent = <AlertsPage />;
  } else {
    pageContent = <DashboardPage onSelectSatellite={handleSelectSatellite} onSelectTab={setActiveTab} />;
  }

  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#030712', color: '#f8fafc', fontFamily: 'Manrope, system-ui, sans-serif' }}>
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content Region */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Top Header Navbar */}
          <Navbar onEmergencyTriggered={handleEmergencyTriggered} />

          {/* Emergency Trigger Toast Notification */}
          {notification && (
            <div style={{
              background: 'linear-gradient(90deg, rgba(244, 63, 94, 0.2), rgba(245, 158, 11, 0.2))',
              borderBottom: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fb7185',
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
                style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }}
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
