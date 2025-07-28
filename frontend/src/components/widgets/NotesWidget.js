import React, { useState, useEffect } from 'react';
import '../styles/NotesWidget.css';

const NotesWidget = ({ widget, token }) => {
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);

  // Fetch note from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/widget-data/${widget.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setText(data[data.length - 1].data.text || '');
        }
      } catch (err) {
        setText('');
      }
    };
    fetchData();
  }, [widget.id, token]);

  // Save note to backend when editing ends
  const handleBlur = async () => {
    setEditing(false);
    if (!widget.id || !token) return;
    await fetch(`${process.env.REACT_APP_API_URL}/api/widget-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        widget_id: widget.id,
        data: { text }
      })
    });
  };

  return (
    <div className="sticky-note">
      <div className="widget-title">{widget.title || 'Note'}</div>
      {editing ? (
        <textarea
          value={text}
          maxLength={120}
          onChange={e => setText(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          rows={4}
        />
      ) : (
        <div className="note-text" onClick={() => setEditing(true)}>
          {text || <span className="note-placeholder">Click to add a note...</span>}
        </div>
      )}
    </div>
  );
};

export default NotesWidget;
