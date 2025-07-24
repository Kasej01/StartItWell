const supabase = require('../db');

exports.addWidgetData = async (req, res) => {
  const user_id = req.user.id;
  const { widget_id, data } = req.body;

  try {
    // First verify the widget belongs to this user
    const { data: widget, error: widgetError } = await supabase
      .from('user_widgets')
      .select('id')
      .eq('id', widget_id)
      .eq('user_id', user_id)
      .single();

    if (widgetError || !widget) {
      return res.status(404).json({ error: 'Widget not found or access denied' });
    }

    // Now insert the widget data
    const { data: inserted, error } = await supabase
      .from('widget_data')
      .insert([{ widget_id, data }])
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json(inserted);
  } catch (err) {
    console.error('Add widget data error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get data for a specific widget
exports.getWidgetData = async (req, res) => {
  const user_id = req.user.id;
  const widget_id = req.params.widgetId;
  
  try {
    // First verify the widget belongs to this user
    const { data: widget, error: widgetError } = await supabase
      .from('user_widgets')
      .select('id')
      .eq('id', widget_id)
      .eq('user_id', user_id)
      .single();
    
    if (widgetError || !widget) {
      return res.status(404).json({ error: 'Widget not found or access denied' });
    }
    
    // Get all data for this widget
    const { data, error } = await supabase
      .from('widget_data')
      .select('*')
      .eq('widget_id', widget_id);
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Get widget data error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update widget data item
exports.updateWidgetData = async (req, res) => {
  const user_id = req.user.id;
  const data_id = req.params.id;
  const { value, extra_data } = req.body;
  
  try {
    // First verify the widget data belongs to this user's widget
    const { data: widgetData, error: dataError } = await supabase
      .from('widget_data')
      .select('widget_data.id, user_widgets.user_id')
      .eq('widget_data.id', data_id)
      .join('user_widgets', {'widget_data.widget_id': 'user_widgets.id'})
      .single();
    
    if (dataError || !widgetData || widgetData.user_id !== user_id) {
      return res.status(404).json({ error: 'Data not found or access denied' });
    }
    
    // Now update the data
    const { data, error } = await supabase
      .from('widget_data')
      .update({ value, extra_data })
      .eq('id', data_id)
      .select('*')
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Update widget data error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete widget data item
exports.deleteWidgetData = async (req, res) => {
  const user_id = req.user.id;
  const data_id = req.params.id;
  
  try {
    // First verify the widget data belongs to this user's widget
    const { data: widgetData, error: dataError } = await supabase
      .from('widget_data')
      .select('widget_data.id, user_widgets.user_id')
      .eq('widget_data.id', data_id)
      .join('user_widgets', {'widget_data.widget_id': 'user_widgets.id'})
      .single();
    
    if (dataError || !widgetData || widgetData.user_id !== user_id) {
      return res.status(404).json({ error: 'Data not found or access denied' });
    }
    
    // Now delete the data
    const { error } = await supabase
      .from('widget_data')
      .delete()
      .eq('id', data_id);
    
    if (error) throw error;
    res.json({ message: 'Widget data deleted' });
  } catch (err) {
    console.error('Delete widget data error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};