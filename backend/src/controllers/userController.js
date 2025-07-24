const supabase = require('../db');
const bcrypt = require('bcrypt');

// Get user info (excluding password)
exports.getUser = async (req, res) => {
  if (parseInt(req.params.id, 10) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, created_at')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'User not found' });

    res.json(data);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user info (except password)
exports.updateUser = async (req, res) => {
  if (parseInt(req.params.id, 10) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { first_name, last_name, email } = req.body;
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ first_name, last_name, email })
      .eq('id', req.params.id)
      .select('id, first_name, last_name, email, created_at')
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'User not found' });

    res.json(data);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update password (requires current password)
exports.updatePassword = async (req, res) => {
  if (parseInt(req.params.id, 10) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { currentPassword, newPassword } = req.body;
  try {
    // Get the user with password
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', req.params.id)
      .single();

    if (fetchError) throw fetchError;
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Current password incorrect' });

    // Update with new hashed password
    const hashed = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashed })
      .eq('id', req.params.id);

    if (updateError) throw updateError;

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  if (parseInt(req.params.id, 10) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};