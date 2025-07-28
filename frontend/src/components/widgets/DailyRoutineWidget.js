import React, { useState, useEffect } from 'react';
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

function showConfetti() {
  // Simple confetti using canvas-confetti (if installed)
  if (window.confetti) {
    window.confetti();
  } else {
    // fallback: flash screen
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.top = 0;
    el.style.left = 0;
    el.style.width = '100vw';
    el.style.height = '100vh';
    el.style.background = 'rgba(255,255,255,0.7)';
    el.style.zIndex = 9999;
    el.innerHTML = '<div style="font-size:3em;text-align:center;margin-top:40vh;">🎉</div>';
    document.body.appendChild(el);
    setTimeout(() => document.body.removeChild(el), 1200);
  }
}

const DailyRoutineWidget = ({ widget, token }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [showTemplate, setShowTemplate] = useState(false);

  // Load from backend or widget data
  useEffect(() => {
    if (widget.items) setItems(widget.items);
    else setShowTemplate(true);
  }, [widget.items]);

  // Progress calculation
  const completed = items.filter(i => i.done).length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;

  // Fireworks/confetti when completed
  useEffect(() => {
    if (items.length > 0 && completed === items.length) showConfetti();
  }, [completed, items.length]);

  // Add item
  const handleAddItem = e => {
    e.preventDefault();
    if (newItem.trim()) {
      setItems([...items, { text: newItem.trim(), done: false }]);
      setNewItem('');
    }
  };

  // Toggle item
  const toggleItem = idx => {
    setItems(items =>
      items.map((item, i) => i === idx ? { ...item, done: !item.done } : item)
    );
  };

  // Template selection
  const handleTemplateSelect = template => {
    setItems(template.items.map(text => ({ text, done: false })));
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
          <button onClick={() => setShowTemplate(false)}>Start Blank</button>
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