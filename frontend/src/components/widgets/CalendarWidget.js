import React, { useState, useEffect } from 'react';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import { parseISO, format, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/CalendarWidget.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};
const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const CalendarWidget = ({ widget, token }) => {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState(Views.WEEK);
  const [date, setDate] = useState(new Date()); // <-- Add this line
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: '',
    end: ''
  });

  // Add this state for editing
  const [editEvent, setEditEvent] = useState(null);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      const res = await fetch(`/api/calendar-events/${widget.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setEvents(
        Array.isArray(data)
          ? data.map(ev => ({
              ...ev,
              start: new Date(ev.start),
              end: new Date(ev.end)
            }))
          : []
      );
    };
    fetchEvents();
  }, [widget.id, token]);

  // Add event handler
  const handleAddEvent = async (e) => {
    e.preventDefault();

    // Convert local datetime-local values to UTC ISO strings
    const startUTC = new Date(newEvent.start).toISOString();
    const endUTC = new Date(newEvent.end).toISOString();

    const res = await fetch('/api/calendar-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        widget_id: widget.id,
        ...newEvent,
        start: startUTC,
        end: endUTC
      })
    });
    if (res.ok) {
      setShowAdd(false);
      setNewEvent({ title: '', description: '', start: '', end: '' });
      // Refresh events
      const updated = await res.json();
      setEvents(events => [
        ...events,
        { ...updated, start: new Date(updated.start), end: new Date(updated.end) }
      ]);
    }
  };

  // Handle view change
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Handle navigation (next/back/today)
  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  // Handler for saving edits
  const handleEditSave = async (e) => {
    e.preventDefault();
    const startUTC = new Date(editEvent.start).toISOString();
    const endUTC = new Date(editEvent.end).toISOString();
    const res = await fetch(`/api/calendar-events/${editEvent.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: editEvent.title,
        description: editEvent.description,
        start: startUTC,
        end: endUTC
      })
    });
    if (res.ok) {
      const updated = await res.json();
      setEvents(events =>
        events.map(ev =>
          ev.id === updated.id
            ? { ...updated, start: new Date(updated.start), end: new Date(updated.end) }
            : ev
        )
      );
      setEditEvent(null);
      setSelectedEvent(null);
    }
  };

  // Handler for delete
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    await fetch(`/api/calendar-events/${selectedEvent.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setEvents(events => events.filter(ev => ev.id !== selectedEvent.id));
    setSelectedEvent(null);
    setEditEvent(null);
  };

  // Helper for datetime-local input
  function toLocalInputValue(date) {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0,16);
  }

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <h4>{widget.title || 'My Calendar'}</h4>
        <button onClick={() => setShowAdd(true)}>+ Add Event</button>
        <button onClick={() => setView(view === Views.WEEK ? Views.DAY : Views.WEEK)}>
          {view === Views.WEEK ? 'Daily View' : 'Weekly View'}
        </button>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        defaultView={view}
        view={view}
        date={date}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        views={[Views.DAY, Views.WEEK]}
        style={{ height: 400 }}
        onSelectEvent={event => setSelectedEvent(event)}
      />

      {/* Event Detail/Edit Modal */}
      {(selectedEvent || editEvent) && (
        <div className="calendar-modal-bg" onClick={() => { setSelectedEvent(null); setEditEvent(null); }}>
          <div className="calendar-modal" onClick={e => e.stopPropagation()}>
            {editEvent ? (
              <form onSubmit={handleEditSave}>
                <h5>Edit Event</h5>
                <label>
                  Title:
                  <input
                    value={editEvent.title}
                    onChange={e => setEditEvent({ ...editEvent, title: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Description:
                  <textarea
                    value={editEvent.description}
                    onChange={e => setEditEvent({ ...editEvent, description: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Start:
                  <input
                    type="datetime-local"
                    value={toLocalInputValue(editEvent.start)}
                    onChange={e => setEditEvent({ ...editEvent, start: e.target.value })}
                    required
                  />
                </label>
                <label>
                  End:
                  <input
                    type="datetime-local"
                    value={toLocalInputValue(editEvent.end)}
                    onChange={e => setEditEvent({ ...editEvent, end: e.target.value })}
                    required
                  />
                </label>
                <div className="calendar-modal-actions">
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditEvent(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <h5>{selectedEvent.title}</h5>
                <div>
                  <b>When:</b> {selectedEvent.start.toLocaleString()} - {selectedEvent.end.toLocaleString()}
                </div>
                <div>
                  <b>Description:</b> {selectedEvent.description}
                </div>
                <div className="calendar-modal-actions">
                  <button onClick={() => setEditEvent(selectedEvent)}>Edit</button>
                  <button onClick={handleDeleteEvent} style={{ background: '#e53935' }}>Delete</button>
                  <button onClick={() => setSelectedEvent(null)}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ...rest of your code... */}
    </div>
  );
};

export default CalendarWidget;