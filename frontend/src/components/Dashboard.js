import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './styles/Dashboard.css';
import TodoWidget from './widgets/TodoWidget';
import CalendarWidget from './widgets/CalendarWidget';


const getGridSettings = () => {
  const width = window.innerWidth;
  if (width >= 1600) return { cols: 12, width: 1600 };
  if (width >= 1200) return { cols: 8, width: 1200 };
  if (width >= 900) return { cols: 6, width: 900 };
  return { cols: 2, width: Math.max(width - 32, 320) };
};

const Dashboard = ({ user, token }) => {
  const [widgets, setWidgets] = useState([]);
  const [editing, setEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newWidget, setNewWidget] = useState({ title: '', type: '' });
  const [gridSettings, setGridSettings] = useState(getGridSettings());

  const WIDGET_TYPE_DEFAULT_SIZES = {
    todo: { size_x: 3, size_y: 4 },
    calendar: { size_x: 8, size_y: 4 }, // larger than todo
  };
  const defaultSize = WIDGET_TYPE_DEFAULT_SIZES[newWidget.type] || { size_x: 2, size_y: 2 };


  // Responsive grid settings
  useEffect(() => {
    const handleResize = () => setGridSettings(getGridSettings());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch widgets from backend
  useEffect(() => {
    const fetchWidgets = async () => {
      const res = await fetch('/api/widgets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setWidgets(data);
      } else if (data && Array.isArray(data.data)) {
        setWidgets(data.data);
      } else {
        setWidgets([]);
      }
    };
    fetchWidgets();
  }, [token]);

  // Layout for react-grid-layout
  const layout = widgets.map((w, i) => ({
    i: w.id.toString(),
    x: w.pos_x || (i % gridSettings.cols),
    y: w.pos_y || Math.floor(i / gridSettings.cols),
    w: w.size_x || 2,
    h: w.size_y || 2,
    static: !editing
  }));

  // Handle widget position/size change
  const onLayoutChange = async (newLayout) => {
    if (!editing) return;
    setWidgets(widgets =>
      widgets.map(w => {
        const l = newLayout.find(l => l.i === w.id.toString());
        return l
          ? { ...w, pos_x: l.x, pos_y: l.y, size_x: l.w, size_y: l.h }
          : w;
      })
    );
    // Send updates to backend for persistence
    for (const l of newLayout) {
      await fetch(`/api/widgets/${l.i}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          pos_x: l.x,
          pos_y: l.y,
          size_x: l.w,
          size_y: l.h
        })
      });
    }
  };

  // Add widget handler
  const handleAddWidget = async e => {
    e.preventDefault();
    const res = await fetch('/api/widgets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...newWidget,
        pos_x: 0,
        pos_y: 0,
        ...defaultSize
      })
    });
    const data = await res.json();
    if (data && data.id) {
      setWidgets([...widgets, data]);
      setShowAdd(false);
      setNewWidget({ title: '', type: '' });
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Your Dashboard</h2>
        <div className="dashboard-header-actions">
          {editing && (
            <button className="dashboard-btn" onClick={() => setShowAdd(true)}>
              + Add Widget
            </button>
          )}
          <button className="dashboard-btn" onClick={() => setEditing(e => !e)}>
            {editing ? 'Exit Edit Mode' : 'Edit Dashboard'}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="add-widget-modal">
          <form className="add-widget-form" onSubmit={handleAddWidget}>
            <h3>Add Widget</h3>
            <label>
              Title:
              <input
                type="text"
                value={newWidget.title}
                onChange={e => setNewWidget({ ...newWidget, title: e.target.value })}
                required
              />
            </label>
            <label>
              Type:
              <select
                value={newWidget.type}
                onChange={e => setNewWidget({ ...newWidget, type: e.target.value })}
                required
              >
                <option value="" disabled>Select a widget type</option>
                <option value="todo">To-Do</option>
                <option value="calendar">Calendar</option>
              </select>
            </label>
            <div className="add-widget-actions">
              <button type="submit" className="dashboard-btn">Add</button>
              <button type="button" className="dashboard-btn cancel" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <GridLayout
        className={`layout${editing ? ' editing' : ''} dashboard-grid-area`}
        layout={layout}
        cols={gridSettings.cols}
        rowHeight={120}
        width={gridSettings.width}
        isDraggable={editing}
        isResizable={editing}
        onLayoutChange={onLayoutChange}
        draggableCancel=".react-draggable-cancel"
      >
        {widgets.map(w => (
          <div key={w.id} className="dashboard-widget">
            {editing && (
              <button
                className="dashboard-widget-delete react-draggable-cancel"
                title="Delete Widget"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this widget?')) {
                    const res = await fetch(`/api/widgets/${w.id}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                      setWidgets(ws => ws.filter(widget => widget.id !== w.id));
                    } else {
                      alert('Failed to delete widget.');
                    }
                  }
                }}
              >
                ✕
              </button>
            )}
            {w.type === 'calendar' ? (
              <CalendarWidget widget={w} token={token} />
            ) : w.type === 'todo' ? (
              <TodoWidget widget={w} token={token} />
            ) : (
                <>
                  <div className="widget-title">{w.title}</div>
                  <div className="widget-type">{w.type}</div>
                </>
              )
            }
          </div>
        ))}
      </GridLayout>
    </div>
  );
};

export default Dashboard;