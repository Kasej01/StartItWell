const supabase = require('../db');

// Add a new widget
exports.addWidget = async (req, res) => {
  const user_id = req.user.id;
  const { type, title, pos_x, pos_y, size_x, size_y } = req.body;
  try {
    const { data, error } = await supabase
      .from('user_widgets')
      .insert([{ user_id, type, title, pos_x, pos_y, size_x, size_y }])
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Add widget error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Edit a widget (only if it belongs to the user)
exports.editWidget = async (req, res) => {
  const user_id = req.user.id;
  const widget_id = req.params.id;
  const { type, title, pos_x, pos_y, size_x, size_y } = req.body;
  try {
    const { data, error } = await supabase
      .from('user_widgets')
      .update({ type, title, pos_x, pos_y, size_x, size_y })
      .eq('id', widget_id)
      .eq('user_id', user_id)
      .select('*');

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Widget not found' });
    }
    res.json(data[0]);
  } catch (err) {
    console.error('Edit widget error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a widget (only if it belongs to the user)
exports.deleteWidget = async (req, res) => {
  const user_id = req.user.id;
  const widget_id = req.params.id;
  try {
    const { error } = await supabase
      .from('user_widgets')
      .delete()
      .eq('id', widget_id)
      .eq('user_id', user_id);

    if (error) throw error;
    res.json({ message: 'Widget deleted' });
  } catch (err) {
    console.error('Delete widget error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

//Get widgets for the user
exports.getWidgets = async (req, res) => {
  const user_id = req.user.id;
  try {
    const { data, error } = await supabase
      .from('user_widgets')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Get widgets error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};