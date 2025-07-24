import React, { useEffect, useState, useContext } from 'react';
import './styles/AccountDetails.css';
import { AuthContext } from '../context/AuthContext';

const AccountDetails = ({ onLogout }) => {
  const { user, token } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwFields, setPwFields] = useState({
    current1: '', current2: '', newpw: '', error: '', success: ''
  });
  const [delFields, setDelFields] = useState({
    pw1: '', pw2: '', error: '', confirm: false
  });

  // Fetch user info
  useEffect(() => {
    if (!user || !token) return;
    fetch(`/api/users/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setUserData(data);
        setForm({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email
        });
      });
  }, [user, token]);

  // Handle edit form
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = async e => {
    e.preventDefault();
    console.log('handleSave called');
    setLoading(true);
    setMsg('');
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      setUserData(data);
      setEdit(false);
      setMsg('Profile updated!');
    } else {
      setMsg(data.error || 'Update failed');
    }
    setLoading(false);
  };

  // Change password logic
  const handlePwChange = e => setPwFields({ ...pwFields, [e.target.name]: e.target.value, error: '', success: '' });
  const submitPw = async e => {
    e.preventDefault();
    if (!pwFields.current1 || !pwFields.current2 || !pwFields.newpw) {
      setPwFields(f => ({ ...f, error: 'All fields required' })); return;
    }
    if (pwFields.current1 !== pwFields.current2) {
      setPwFields(f => ({ ...f, error: 'Current passwords do not match' })); return;
    }
    if (pwFields.current1 === pwFields.newpw) {
      setPwFields(f => ({ ...f, error: 'New password must be different' })); return;
    }
    const res = await fetch(`/api/users/${user.id}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: pwFields.current1,
        newPassword: pwFields.newpw
      })
    });
    const data = await res.json();
    if (res.ok) {
      setPwFields({ current1: '', current2: '', newpw: '', error: '', success: 'Password updated!' });
      setShowChangePw(false);
    } else {
      setPwFields(f => ({ ...f, error: data.error || 'Failed to update password' }));
    }
  };

  // Delete account logic
  const handleDelChange = e => setDelFields({ ...delFields, [e.target.name]: e.target.value, error: '' });
  const submitDel = async e => {
    e.preventDefault();
    if (!delFields.pw1 || !delFields.pw2) {
      setDelFields(f => ({ ...f, error: 'Both password fields required' })); return;
    }
    if (delFields.pw1 !== delFields.pw2) {
      setDelFields(f => ({ ...f, error: 'Passwords do not match' })); return;
    }
    setDelFields(f => ({ ...f, confirm: true }));
  };
  const confirmDelete = async () => {
    const res = await fetch(`/api/users/${user.id}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: delFields.pw1,
        newPassword: delFields.pw1 // won't actually update, just check
      })
    });
    if (!res.ok) {
      setDelFields(f => ({ ...f, error: 'Password incorrect', confirm: false }));
      return;
    }
    // Now delete
    const delRes = await fetch(`/api/users/${user.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (delRes.ok) {
      onLogout && onLogout();
    } else {
      setDelFields(f => ({ ...f, error: 'Failed to delete account', confirm: false }));
    }
  };

  if (!user || !token || !userData) return <div>Loading...</div>;

  return (
    <div className="account-details">
      <h2>Account Details</h2>
      {msg && <div className="msg">{msg}</div>}
      {edit ? (
        <form onSubmit={handleSave}>
          <div className="form-row">
            <label htmlFor="first_name">First Name:</label>
            <input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label htmlFor="last_name">Last Name:</label>
            <input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label htmlFor="email">Email:</label>
            <input id="email" name="email" value={form.email} onChange={handleChange} />
          </div>
          <div>
            <button type="submit" disabled={loading}>Save</button>
            <button type="button" onClick={() => setEdit(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div className="form-row">
            <label>First Name:</label>
            <span>{form.first_name}</span>
          </div>
          <div className="form-row">
            <label>Last Name:</label>
            <span>{form.last_name}</span>
          </div>
          <div className="form-row">
            <label>Email:</label>
            <span>{form.email}</span>
          </div>
          <button type="button" onClick={() => setEdit(true)}>Edit</button>
        </>
      )}
      <hr />
      <button onClick={() => setShowChangePw(true)}>Change Password</button>
      {showChangePw && (
        <div className="modal">
          <form onSubmit={submitPw}>
            <h3>Change Password</h3>
            <div className="form-row">
              <label htmlFor="current1">Current Password:</label>
              <input type="password" id="current1" name="current1" value={pwFields.current1} onChange={handlePwChange} />
            </div>
            <div className="form-row">
              <label htmlFor="current2">Confirm Current Password:</label>
              <input type="password" id="current2" name="current2" value={pwFields.current2} onChange={handlePwChange} />
            </div>
            <div className="form-row">
              <label htmlFor="newpw">New Password:</label>
              <input type="password" id="newpw" name="newpw" value={pwFields.newpw} onChange={handlePwChange} />
            </div>
            {pwFields.error && <div className="error">{pwFields.error}</div>}
            <button type="submit">Update Password</button>
            <button type="button" onClick={() => setShowChangePw(false)}>Cancel</button>
          </form>
        </div>
      )}
      <hr />
      <button className="danger" onClick={() => setShowDelete(true)}>Delete Account</button>
      {showDelete && (
        <div className="modal">
          <form onSubmit={submitDel}>
            <h3>Delete Account</h3>
            <div className="form-row">
              <label htmlFor="pw1">Enter Password:</label>
              <input type="password" id="pw1" name="pw1" value={delFields.pw1} onChange={handleDelChange} />
            </div>
            <div className="form-row">
              <label htmlFor="pw2">Confirm Password:</label>
              <input type="password" id="pw2" name="pw2" value={delFields.pw2} onChange={handleDelChange} />
            </div>
            {delFields.error && <div className="error">{delFields.error}</div>}
            <button type="submit">Continue</button>
            <button type="button" onClick={() => setShowDelete(false)}>Cancel</button>
          </form>
          {delFields.confirm && (
            <div className="modal confirm">
              <p>Are you sure you want to delete your account? This cannot be undone.</p>
              <button className="danger" onClick={confirmDelete}>Yes, Delete</button>
              <button onClick={() => setDelFields(f => ({ ...f, confirm: false }))}>Cancel</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountDetails;