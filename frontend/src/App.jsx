import React, { useState, useEffect } from 'react';
import { IntroExperience } from './components/intro/IntroExperience.jsx';
import { MissionControlDashboard } from './components/dashboard/MissionControlDashboard.jsx';
import { CrewPage } from './components/crew/CrewPage.jsx';
import { AstronautProfile } from './components/crew/AstronautProfile.jsx';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Match /crew/:id
  const crewProfileMatch = currentPath.match(/^\/crew\/(\d+)$/);

  return (
    <>
      {showIntro && (
        <IntroExperience onEnter={() => setShowIntro(false)} />
      )}

      {!showIntro && (
        <main>
          {crewProfileMatch ? (
            <AstronautProfile id={crewProfileMatch[1]} onNavigate={navigate} />
          ) : currentPath === '/crew' ? (
            <CrewPage onNavigate={navigate} />
          ) : (
            <MissionControlDashboard onNavigate={navigate} />
          )}
        </main>
      )}
    </>
  );
}
