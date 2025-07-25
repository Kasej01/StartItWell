const supabase = require('../db');

// Get all events for a widget (and user)
exports.getEvents = async (req, res) => {
  const user_id = req.user.id;
  const widget_id = req.params.widgetId;
  try {
    // Ensure widget belongs to user
    const { data: widget, error: widgetError } = await supabase
      .from('user_widgets')
      .select('id')
      .eq('id', widget_id)
      .eq('user_id', user_id)
      .single();
    if (widgetError || !widget) return res.status(404).json({ error: 'Widget not found or access denied' });

    // Get events
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('widget_id', widget_id);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add event
exports.addEvent = async (req, res) => {
  const user_id = req.user.id;
  const { widget_id, title, description, start, end } = req.body;
  try {
    // Ensure widget belongs to user
    const { data: widget, error: widgetError } = await supabase
      .from('user_widgets')
      .select('id')
      .eq('id', widget_id)
      .eq('user_id', user_id)
      .single();
    if (widgetError || !widget) return res.status(404).json({ error: 'Widget not found or access denied' });

    // Insert event
    const { data: inserted, error } = await supabase
      .from('calendar_events')
      .insert([{ widget_id, title, description, start, end }])
      .select('*')
      .single();
    if (error) throw error;
    res.status(201).json(inserted);
  } catch (err) {
    console.error('Add event error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  const user_id = req.user.id;
  const event_id = req.params.id;
  const { title, description, start, end } = req.body;
  try {
    // Get event and widget
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .select('id, widget_id')
      .eq('id', event_id)
      .single();
    if (eventError || !event) return res.status(404).json({ error: 'Event not found' });

    // Ensure widget belongs to user
    const { data: widget, error: widgetError } = await supabase
      .from('user_widgets')
      .select('user_id')
      .eq('id', event.widget_id)
      .single();
    if (widgetError || !widget || widget.user_id !== user_id) return res.status(403).json({ error: 'Access denied' });

    // Update event
    const { data: updated, error } = await supabase
      .from('calendar_events')
      .update({ title, description, start, end })
      .eq('id', event_id)
      .select('*')
      .single();
    if (error) throw error;
    res.json(updated);
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  const user_id = req.user.id;
  const event_id = req.params.id;
  try {
    // Get event and widget
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .select('id, widget_id')
      .eq('id', event_id)
      .single();
    if (eventError || !event) return res.status(404).json({ error: 'Event not found' });

    // Ensure widget belongs to user
    const { data: widget, error: widgetError } = await supabase
      .from('user_widgets')
      .select('user_id')
      .eq('id', event.widget_id)
      .single();
    if (widgetError || !widget || widget.user_id !== user_id) return res.status(403).json({ error: 'Access denied' });

    // Delete event
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', event_id);
    if (error) throw error;
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};