import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export function IntroExperience({ onEnter }) {
  const [showButton, setShowButton] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Safe fallback timer if video onTimeUpdate is delayed or video fails to load
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 5500);

    return () => clearTimeout(timer);
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= 5 && !showButton) {
      setShowButton(true);
    }
  };

  const handleEnterClick = () => {
    if (isEntering) return;
    setIsEntering(true);

    // Zoom transition duration ~900ms
    setTimeout(() => {
      if (onEnter) onEnter();
    }, 900);
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && showButton && !isEntering) {
      e.preventDefault();
      handleEnterClick();
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: isEntering ? 'wait' : 'default',
        color: '#ffffff',
        fontFamily: 'Manrope, system-ui, sans-serif'
      }}
    >
      {/* Cinematic Background Video in ORIGINAL COLOR or Image Fallback */}
      {!videoError ? (
        <video
          ref={videoRef}
          src="/media/video/orbitops-intro.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nodownload noplaybackrate noremoteplayback"
          onTimeUpdate={handleTimeUpdate}
          onError={() => setVideoError(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(80%) contrast(105%)',
            transform: isEntering ? 'scale(1.25)' : 'scale(1)',
            transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform'
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/media/nasa/iss_interior.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(60%) contrast(105%)',
            transform: isEntering ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      )}

      {/* Subtle Black Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isEntering
            ? '#000000'
            : 'radial-gradient(circle at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.85) 100%)',
          opacity: isEntering ? 1 : 0.8,
          transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none'
        }}
      />

      {/* Grid Pattern Decorative Lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: isEntering ? 0 : 0.6,
          transition: 'opacity 0.6s ease',
          pointerEvents: 'none'
        }}
      />

      {/* Main Content Area */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: '700px',
          padding: '0 2rem',
          opacity: isEntering ? 0 : 1,
          transform: isEntering ? 'scale(0.92)' : 'scale(1)',
          transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            letterSpacing: '2px',
            color: '#dadada',
            marginBottom: '1.5rem',
            backdropFilter: 'blur(4px)'
          }}
        >
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }} />
          INITIALIZING MISSION CONTROL
        </div>

        <h1
          style={{
            fontSize: 'calc(3rem + 2vw)',
            fontWeight: 900,
            letterSpacing: '6px',
            margin: '0 0 1rem 0',
            color: '#ffffff',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            textShadow: '0 4px 30px rgba(0, 0, 0, 0.8)'
          }}
        >
          ORBIT<span style={{ color: '#777777' }}>OPS</span>
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: '#bdbdbd',
            letterSpacing: '3px',
            fontFamily: 'DM Mono, monospace',
            textTransform: 'uppercase',
            margin: '0 0 2.5rem 0'
          }}
        >
          Integrated Space Station & Satellite Operations DBMS
        </p>

        {/* Enter Button (Appears after 5 seconds of video playback) */}
        <div style={{ height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {showButton && (
            <button
              onClick={handleEnterClick}
              disabled={isEntering}
              aria-label="Enter OrbitOps Mission Control"
              style={{
                background: '#000000',
                border: '1px solid #ffffff',
                color: '#ffffff',
                padding: '14px 36px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                fontFamily: 'DM Mono, monospace',
                letterSpacing: '2px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
                animation: 'introButtonFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              <span>ENTER ORBITOPS</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Footer System Telemetry Note */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          fontFamily: 'DM Mono, monospace',
          fontSize: '10px',
          color: '#777777',
          letterSpacing: '1px',
          opacity: isEntering ? 0 : 0.8,
          transition: 'opacity 0.4s ease'
        }}
      >
        ORBITOPS DBMS v2.4 // REAL ISS ORBIT · CELESTRAK TLE · SIMULATED MISSION TELEMETRY
      </div>

      <style>{`
        @keyframes introButtonFade {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

