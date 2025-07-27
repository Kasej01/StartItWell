import React, { useState, useEffect, useRef } from 'react';
import '../styles/FocusTimerWidget.css';

const DEFAULTS = {
  workDuration: 25 * 60,
  soundEnabled: true,
  visualCue: 'flash'
};

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Simple beep using Web Audio API
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.connect(ctx.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      ctx.close();
    }, 300);
  } catch (e) {
    // ignore errors
  }
}

const FocusTimerWidget = ({ widget, token }) => {
  const [settings, setSettings] = useState(DEFAULTS);
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULTS.workDuration);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef();

  // Fetch timer data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/widget-data/${widget.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[data.length - 1].data;
          setSettings(s => ({ ...s, ...latest }));
          setRemainingSeconds(latest.remainingSeconds ?? DEFAULTS.workDuration);
        }
      } catch (err) {
        // fallback to defaults
      }
    };
    fetchData();
  }, [widget.id, token]);

  // Timer logic
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemainingSeconds(sec => {
        if (sec > 0) {
          return sec - 1;
        } else {
          handleTimerEnd();
          return sec;
        }
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Save timer state to backend
  useEffect(() => {
    if (!widget.id || !token) return;
    const save = async () => {
      await fetch(`${process.env.REACT_APP_API_URL}/api/widget-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          widget_id: widget.id,
          data: { ...settings, remainingSeconds }
        })
      });
    };
    save();
  }, [remainingSeconds, settings]);

  // Handle timer end
  const handleTimerEnd = () => {
    setRunning(false);
    if (settings.soundEnabled) playBeep();
    if (settings.visualCue === 'flash') flashScreen();
  };

  // Visual cue
  const flashScreen = () => {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.top = 0;
    el.style.left = 0;
    el.style.width = '100vw';
    el.style.height = '100vh';
    el.style.background = 'rgba(255,255,0,0.25)';
    el.style.zIndex = 9999;
    document.body.appendChild(el);
    setTimeout(() => document.body.removeChild(el), 600);
  };

  // Controls
  const handleStart = () => setRunning(true);
  const handlePause = () => setRunning(false);
  const handleReset = () => {
    setRunning(false);
    setRemainingSeconds(settings.workDuration);
  };

  // Settings modal
  const handleSettingsSave = (e) => {
    e.preventDefault();
    setShowSettings(false);
    // If not running, update timer immediately
    if (!running) setRemainingSeconds(settings.workDuration);
  };

  return (
    <div className="focus-timer-widget">
      <div className="widget-title">{widget.title || 'Focus Timer'}</div>
      <div className="timer-main">
        <div className="timer-session work">Work</div>
        <div className="timer-countdown">{formatTime(remainingSeconds)}</div>
        <div className="timer-controls">
          {!running ? (
            <button onClick={handleStart}>Start</button>
          ) : (
            <button onClick={handlePause}>Pause</button>
          )}
          <button onClick={handleReset}>Reset</button>
          <button onClick={() => setShowSettings(true)}>⚙️</button>
        </div>
      </div>
      {showSettings && (
        <div className="focus-timer-modal-bg" onClick={() => setShowSettings(false)}>
          <form className="focus-timer-modal" onSubmit={handleSettingsSave} onClick={e => e.stopPropagation()}>
            <h5>Timer Settings</h5>
            <label>
              Work Duration (minutes):
              <input
                type="number"
                min={1}
                max={120}
                value={settings.workDuration / 60}
                onChange={e => setSettings(s => ({ ...s, workDuration: Number(e.target.value) * 60 }))}
                required
              />
            </label>
            <label>
              Sound cue:
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={e => setSettings(s => ({ ...s, soundEnabled: e.target.checked }))}
              />
            </label>
            <label>
              Visual cue:
              <select
                value={settings.visualCue}
                onChange={e => setSettings(s => ({ ...s, visualCue: e.target.value }))}
              >
                <option value="flash">Flash</option>
                <option value="none">None</option>
              </select>
            </label>
            <div className="focus-timer-modal-actions">
              <button type="submit">Save</button>
              <button type="button" onClick={() => setShowSettings(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FocusTimerWidget;