import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './styles/Dashboard.css';
import TodoWidget from './widgets/TodoWidget';
import CalendarWidget from './widgets/CalendarWidget';
import FocusTimerWidget from './widgets/FocusTimerWidget';
import NotesWidget from './widgets/NotesWidget';
import DailyRoutineWidget from './widgets/DailyRoutineWidget';
import MotivationalQuoteWidget from './widgets/MotivationalQuoteWidget';


const getGridSettings = () => {
  const width = window.innerWidth;
  if (width >= 1600) return { cols: 14, width: 1600 };
  if (width >= 1200) return { cols: 8, width: 1200 };
  if (width >= 900) return { cols: 6, width: 900 };
  if (width >= 600) return { cols: 4, width: width - 32 };
  return { cols: 4, width: Math.max(width - 16, 320) };
};

const getWidgetDefaultSize = (type) => {
  const width = window.innerWidth;
  if (type === 'todo') return width < 600 ? { size_x: 2, size_y: 3 } : { size_x: 3, size_y: 4 };
  if (type === 'calendar') return width < 600 ? { size_x: 4, size_y: 4 } : { size_x: 8, size_y: 4 };
  if (type === 'focustimer') return width < 600 ? { size_x: 2, size_y: 2 } : { size_x: 3, size_y: 2 };
  if (type === 'notes') return width < 600 ? { size_x: 2, size_y: 1 } : { size_x: 2, size_y: 1 };
  if (type === 'dailyroutine') return width < 600 ? { size_x: 3, size_y: 3 } : { size_x: 3, size_y: 3 };
  if (type === 'motivationalquote') return width < 600 ? { size_x: 3, size_y: 1 } : { size_x: 3, size_y: 1 };
  return { size_x: 3, size_y: 1 };
};

const DEFAULT_TITLES = {
  todo: 'To-Do List',
  notes: '',
  focustimer: 'Timer',
  calendar: 'Calendar'
};

const Dashboard = ({ user, token }) => {
  const [widgets, setWidgets] = useState([]);
  const [editing, setEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newWidget, setNewWidget] = useState({ title: '', type: '' });
  const [gridSettings, setGridSettings] = useState(getGridSettings());

  // Responsive grid and widget sizes
  useEffect(() => {
    let lastIsMobile = window.innerWidth < 600;
    const handleResize = () => {
      const isMobile = window.innerWidth < 600;
      if (isMobile !== lastIsMobile) {
        setGridSettings(getGridSettings());
        setWidgets(widgets =>
          widgets.map(w => ({
            ...w,
            ...getWidgetDefaultSize(w.type)
          }))
        );
        lastIsMobile = isMobile;
      } else {
        setGridSettings(getGridSettings());
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch widgets from backend
  useEffect(() => {
    const fetchWidgets = async () => {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/widgets`, {
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
    x: typeof w.pos_x === 'number' ? w.pos_x : (i % gridSettings.cols),
    y: typeof w.pos_y === 'number' ? w.pos_y : Math.floor(i / gridSettings.cols),
    w: typeof w.size_x === 'number' ? w.size_x : getWidgetDefaultSize(w.type).size_x,
    h: typeof w.size_y === 'number' ? w.size_y : getWidgetDefaultSize(w.type).size_y,
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
      await fetch(`${process.env.REACT_APP_API_URL}/api/widgets/${l.i}`, {
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
    const size = getWidgetDefaultSize(newWidget.type);
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/widgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        type: newWidget.type,
        title: DEFAULT_TITLES[newWidget.type],
        pos_x: 0,
        pos_y: 0,
        ...size
      })
    });
    const data = await res.json();
    if (data && data.id) {
      setWidgets([...widgets, data]);
      setShowAdd(false);
      setNewWidget({ type: '' });
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
              Type:
              <select
                value={newWidget.type}
                onChange={e => setNewWidget({ type: e.target.value })}
                required
              >
                <option value="" disabled>Select a widget type</option>
                <option value="todo">To-Do List</option>
                <option value="notes">Notes</option>
                <option value="focustimer">Timer</option>
                <option value="motivationalquote">Motivational Quote</option>
                <option value="dailyroutine">Daily Routine Checklist</option>
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
                    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/widgets/${w.id}`, {
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
            {w.type === 'notes' ? (
              <NotesWidget widget={w} token={token} />
            ) : w.type === 'calendar' ? (
              <CalendarWidget widget={w} token={token} />
            ) : w.type === 'motivationalquote' ? (
              <MotivationalQuoteWidget widget={w} token={token} />
            ): w.type === 'dailyroutine' ? (
              <DailyRoutineWidget widget={w} token={token} />
            ) : w.type === 'focustimer' ? (
              <FocusTimerWidget widget={w} token={token} />
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