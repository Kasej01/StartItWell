import React, { useState, useEffect } from 'react';
import '../styles/TodoWidget.css';
import ReactDOM from 'react-dom';

const TodoWidget = ({ widget, token }) => {
  const [title, setTitle] = useState(widget.title || 'My To-Do List');
  const [editingTitle, setEditingTitle] = useState(false);
  const [items, setItems] = useState(widget.items || []);
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editDetail, setEditDetail] = useState(null);

  // Save widget title to DB
  const saveTitle = async (newTitle) => {
    setTitle(newTitle);
    setEditingTitle(false);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/widgets/${widget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle })
      });
      if (!res.ok) throw new Error('Failed to update widget title');
    } catch (err) {
      console.error('Failed to update widget title:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (confirmDelete) {
      await deleteItem(confirmDelete);
      setConfirmDelete(null);
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/widget-data/${widget.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        // Save both the widget_data id and the todo data for updates
        const todoItems = Array.isArray(data)
          ? data.map(item => ({ ...item.data, _dbId: item.id }))
          : [];
        setItems(todoItems);
      } catch (err) {
        console.error('Failed to load todo items:', err);
      }
    };
    fetchItems();
  }, [widget.id, token]);

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    due: '',
    priority: 'Normal'
  });

  // Mark item as done/undone
  const toggleDone = async id => {
    setItems(items =>
      items.map(item =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
    // Find the item and its db id
    const item = items.find(i => i.id === id);
    if (!item || !item._dbId) return;
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/widget-data/${item._dbId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: { ...item, done: !item.done }
        })
      });
    } catch (err) {
      console.error('Failed to update todo status:', err);
    }
  };

  // Delete item
  const deleteItem = async id => {
    const item = items.find(i => i.id === id);
    setItems(items => items.filter(item => item.id !== id));
    setShowDetail(null);
    if (!item || !item._dbId) return;
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/widget-data/${item._dbId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    const newId = Date.now();
    const newTodoItem = { ...newItem, id: newId, done: false };

    setItems([...items, newTodoItem]);
    setShowAdd(false);
    setNewItem({ name: '', description: '', due: '', priority: 'Normal' });

    // Save to database
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/widget-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          widget_id: widget.id,
          data: newTodoItem
        })
      });

      if (res.ok) {
        const dbItem = await res.json();
        // Update the item in state with the db id
        setItems(items =>
          items.map(item =>
            item.id === newId ? { ...item, _dbId: dbItem.id } : item
          )
        );
      } else {
        console.error('Failed to save todo item');
      }
    } catch (err) {
      console.error('Error saving todo item:', err);
    }
  };

  // Edit item handlers
  const handleEditDetail = (item) => {
    setEditDetail({ ...item });
    setShowDetail(null);
  };

  const handleEditDetailChange = (field, value) => {
    setEditDetail(editDetail => ({ ...editDetail, [field]: value }));
  };

  const handleEditDetailSave = async () => {
    if (!editDetail || !editDetail._dbId) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/widget-data/${editDetail._dbId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: editDetail })
      });
      if (res.ok) {
        setItems(items =>
          items.map(item =>
            item.id === editDetail.id ? { ...editDetail } : item
          )
        );
        setEditDetail(null);
      } else {
        console.error('Failed to update todo item');
      }
    } catch (err) {
      console.error('Failed to update todo item:', err);
    }
  };

  return (
    <div className="todo-widget">
      <div className="todo-header">
        {editingTitle ? (
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => saveTitle(title)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.target.blur();
              }
            }}
            autoFocus
          />
        ) : (
          <h4 onClick={() => setEditingTitle(true)} title="Click to edit">{title}</h4>
        )}
      </div>
      {/* Column headers */}
      <div className="todo-list-header">
        <span className="todo-col-checkbox"></span>
        <span className="todo-col-name">Name</span>
        <span className="todo-col-due">Due Date</span>
        <span className="todo-col-priority">Priority</span>
        <span className="todo-col-actions"></span>
      </div>
      <div className="todo-list-container"> {/* Add this container div */}
        <ul className="todo-list">
          {items.map(item => (
            <li
              key={item.id}
              className={`todo-list-item${item.done ? ' done' : ''}`}
            >
              <input
                type="checkbox"
                checked={!!item.done}
                onChange={() => toggleDone(item.id)}
                title="Mark as done"
              />
              <span
                className="todo-item-name"
                onClick={() => handleEditDetail(item)}
                style={{ textDecoration: item.done ? 'line-through' : 'none', cursor: 'pointer' }}
              >
                {item.name}
              </span>
              <span className="todo-item-due">{item.due}</span>
              <span className={`priority-ball ${item.priority.toLowerCase()}`}>
                <span className="priority-ball-tooltip">
                  {item.priority}
                </span>
              </span>            <button
                className="todo-delete-btn"
                title="Delete"
                onClick={() => setConfirmDelete(item.id)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="todo-list-add-row">
          <button className="todo-add-btn" onClick={() => setShowAdd(true)}>+ Add</button>
      </div>

      {/* Delete confirmation popup */}
      {confirmDelete && ReactDOM.createPortal(
        <div className="todo-modal-bg" onClick={() => setConfirmDelete(null)}>
          <div className="todo-modal" onClick={e => e.stopPropagation()}>
            <h5>Delete To-Do Item</h5>
            <p>Are you sure you want to delete this item?</p>
            <div className="todo-modal-actions">
              <button onClick={handleDeleteConfirm} style={{ background: '#e53935', color: '#fff' }}>Delete</button>
              <button onClick={() => setConfirmDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Item Modal */}
      {showAdd && ReactDOM.createPortal(
        <div className="todo-modal-bg">
          <form className="todo-modal" onSubmit={handleAddItem}>
            <h5>Add To-Do Item</h5>
            <label>
              Name:
              <input
                value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                required
              />
            </label>
            <label>
              Short Description:
              <textarea
                value={newItem.description}
                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                required
              />
            </label>
            <label>
              Due Date:
              <input
                type="date"
                value={newItem.due}
                onChange={e => setNewItem({ ...newItem, due: e.target.value })}
                required
              />
            </label>
            <label>
              Priority:
              <select
                value={newItem.priority}
                onChange={e => setNewItem({ ...newItem, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
              </select>
            </label>
            <div className="todo-modal-actions">
              <button type="submit">Add</button>
              <button type="button" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Edit/Detail Modal */}
      {editDetail && ReactDOM.createPortal(
        <div className="todo-modal-bg" onClick={() => setEditDetail(null)}>
          <div className="todo-modal" onClick={e => e.stopPropagation()}>
            <h5>Edit To-Do Item</h5>
            <label>
              Name:
              <input
                value={editDetail.name}
                onChange={e => handleEditDetailChange('name', e.target.value)}
                required
              />
            </label>
            <label>
              Short Description:
              <textarea
                value={newItem.description}
                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                required
              />
            </label>
            <label>
              Due Date:
              <input
                type="date"
                value={editDetail.due}
                onChange={e => handleEditDetailChange('due', e.target.value)}
                required
              />
            </label>
            <label>
              Priority:
              <select
                value={editDetail.priority}
                onChange={e => handleEditDetailChange('priority', e.target.value)}
              >
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
              </select>
            </label>
            <div className="todo-modal-actions">
              <button onClick={handleEditDetailSave} style={{ background: '#43a047', color: '#fff' }}>Save</button>
              <button onClick={() => setEditDetail(null)}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TodoWidget;