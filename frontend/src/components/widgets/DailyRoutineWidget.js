import React, { useState, useEffect, useRef } from 'react';
import '../styles/DailyRoutineWidget.css';

// Example templates
const ROUTINE_TEMPLATES = [
  {
    name: 'Morning Routine',
    items: ['Wake up', 'Brush teeth', 'Exercise', 'Shower', 'Breakfast']
  },
  {
    name: 'Evening Routine',
    items: ['Dinner', 'Read', 'Meditate', 'Prepare for tomorrow', 'Sleep']
  }
];

// Confetti from bottom center using canvas-confetti (must be loaded in public/index.html or via npm)
function shootConfetti() {
  if (window.confetti) {
    window.confetti({
      particleCount: 120,
      spread: 90,
      origin: { x: 0.5, y: 1 },
      startVelocity: 35,
      angle: 90,
      colors: ['#8ab4f8', '#43a047', '#ffd600', '#e53935', '#fff']
    });
  }
}

const DailyRoutineWidget = ({ widget, token }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [showTemplate, setShowTemplate] = useState(false);
  const hasCompleted = useRef(false); // Track if confetti has already been shown

  // Load items from backend on mount
  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/widget-data/${widget.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[data.length - 1].data?.items)) {
          setItems(data[data.length - 1].data.items);
          setShowTemplate(false);
        } else {
          setShowTemplate(true);
        }
      } catch {
        setShowTemplate(true);
      }
    };
    fetchRoutine();
  }, [widget.id, token]);

  // Save items to backend (POST to /api/widget-data)
  const saveRoutine = async (updatedItems) => {
    setItems(updatedItems);
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/widget-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          widget_id: widget.id,
          data: { items: updatedItems }
        })
      });
    } catch {}
  };

  // Progress calculation
  const completed = items.filter(i => i.done).length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;

  // Only shoot confetti when the last item is checked (not on reload)
  const toggleItem = idx => {
    const updatedItems = items.map((item, i) => i === idx ? { ...item, done: !item.done } : item);
    const wasComplete = items.every(i => i.done);
    const willBeComplete = updatedItems.every(i => i.done);

    // Only shoot confetti if this action completes the list (was not complete before, now is)
    if (!wasComplete && willBeComplete) {
      shootConfetti();
    }

    saveRoutine(updatedItems);
  };

  // Add item
  const handleAddItem = e => {
    e.preventDefault();
    if (newItem.trim()) {
      const updatedItems = [...items, { text: newItem.trim(), done: false }];
      saveRoutine(updatedItems);
      setNewItem('');
    }
  };

  // Template selection
  const handleTemplateSelect = async (template) => {
    const templateItems = template.items.map(text => ({ text, done: false }));
    await saveRoutine(templateItems);
    setShowTemplate(false);
  };

  return (
    <div className="daily-routine-widget">
      <div className="widget-title">Daily Routine</div>
      {showTemplate ? (
        <div className="routine-template-select">
          <h5>Choose a routine template:</h5>
          {ROUTINE_TEMPLATES.map(t => (
            <button key={t.name} onClick={() => handleTemplateSelect(t)}>{t.name}</button>
          ))}
          <button onClick={() => handleTemplateSelect({ items: [] })}>Start Blank</button>
        </div>
      ) : (
        <>
          <form className="routine-add-form" onSubmit={handleAddItem}>
            <input
              type="text"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              placeholder="Add routine item..."
              maxLength={40}
            />
            <button type="submit">Add</button>
          </form>
          <ul className="routine-list">
            {items.map((item, idx) => (
              <li key={idx} className={item.done ? 'done' : ''}>
                <label>
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleItem(idx)}
                  />
                  {item.text}
                </label>
              </li>
            ))}
          </ul>
          <div className="routine-progress-bar">
            <div className="routine-progress" style={{ width: `${progress}%` }} />
          </div>
          <div className="routine-progress-label">{progress}% Complete</div>
        </>
      )}
    </div>
  );
};

export default DailyRoutineWidget;