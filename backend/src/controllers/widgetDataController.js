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
  const { data } = req.body;

  try {
    // Step 1: Get the widget_data row to find widget_id
    const { data: widgetData, error: dataError } = await supabase
      .from('widget_data')
      .select('id, widget_id')
      .eq('id', data_id)
      .single();

    if (dataError || !widgetData) {
      return res.status(404).json({ error: 'Data not found' });
    }

    // Step 2: Check that the widget belongs to this user
    const { data: widget, error: widgetError } = await supabase
      .from('user_widgets')
      .select('user_id')
      .eq('id', widgetData.widget_id)
      .single();

    if (widgetError || !widget || widget.user_id !== user_id) {
      return res.status(404).json({ error: 'Access denied' });
    }

    // Now update the data
    const { data: updated, error } = await supabase
      .from('widget_data')
      .update({ data })
      .eq('id', data_id)
      .select('*')
      .single();

    if (error) throw error;
    res.json(updated);
  } catch (err) {
    console.error('Update widget data error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete widget data item
exports.deleteWidgetData = async (req, res) => {
  try {
    const user_id = req.user.id;
    const data_id = req.params.id;
    
    // Step 1: Get the widget_data row to find widget_id
    const { data: widgetData, error: dataError } = await supabase
      .from('widget_data')
      .select('id, widget_id')
      .eq('id', data_id)
      .single();

    if (dataError) {
      console.error('Error retrieving widget data:', dataError);
      return res.status(500).json({ error: 'Failed to retrieve widget data' });
    }
    
    if (!widgetData) {
      return res.status(404).json({ error: 'Widget data not found' });
    }

    // Step 2: Check that the widget belongs to this user
    const { data: widget, error: widgetError } = await supabase
      .from('user_widgets')
      .select('user_id')
      .eq('id', widgetData.widget_id)
      .single();

    if (widgetError) {
      console.error('Error checking widget ownership:', widgetError);
      return res.status(500).json({ error: 'Failed to verify ownership' });
    }
    
    if (!widget || widget.user_id !== user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Step 3: Delete the widget data
    const { error: deleteError } = await supabase
      .from('widget_data')
      .delete()
      .eq('id', data_id);
    
    if (deleteError) {
      console.error('Error deleting widget data:', deleteError);
      return res.status(500).json({ error: 'Failed to delete widget data' });
    }
    
    res.status(200).json({ message: 'Widget data deleted successfully' });
  } catch (error) {
    console.error('Error in deleteWidgetData:', error);
    res.status(500).json({ error: 'Server error deleting widget data' });
  }
};