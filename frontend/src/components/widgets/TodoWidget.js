import React, { useState, useEffect } from 'react';
import '../styles/TodoWidget.css';
import ReactDOM from 'react-dom';

const TodoWidget = ({ widget, token }) => {
  const [title, setTitle] = useState(widget.title || 'My To-Do List');
  const [editingTitle, setEditingTitle] = useState(false);
  const [items, setItems] = useState(widget.items || []);
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`/api/widget-data/${widget.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const todoItems = Array.isArray(data)
          ? data.map(item => item.data)
          : [];
        setItems(todoItems);
      } catch (err) {
        console.error('Failed to load todo items:', err);
      }
    };
    fetchItems();
  }, [widget.id, token]);

  // New item state
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    due: '',
    priority: 'Normal'
  });

  // Mark item as done/undone
  const toggleDone = id => {
    setItems(items =>
      items.map(item =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  // Delete item
  const deleteItem = id => {
    setItems(items => items.filter(item => item.id !== id));
    setShowDetail(null);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    const newId = Date.now();
    const newTodoItem = { ...newItem, id: newId, done: false };
    
    // Optimistically update UI
    setItems([...items, newTodoItem]);
    setShowAdd(false);
    setNewItem({ name: '', description: '', due: '', priority: 'Normal' });
    
    // Save to database
    try {
      const res = await fetch('/api/widget-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          widget_id: widget.id,
          data: newTodoItem // send the whole todo object
        })
      });
      
      if (!res.ok) {
        console.error('Failed to save todo item');
      }
    } catch (err) {
      console.error('Error saving todo item:', err);
    }
  };

  return (
    <div className="todo-widget">
      <div className="todo-header">
        {editingTitle ? (
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => setEditingTitle(false)}
            autoFocus
          />
        ) : (
          <h4 onClick={() => setEditingTitle(true)} title="Click to edit">{title}</h4>
        )}
        <button className="todo-add-btn" onClick={() => setShowAdd(true)}>+ Add</button>
      </div>
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
              onClick={() => setShowDetail(item)}
              style={{ textDecoration: item.done ? 'line-through' : 'none', cursor: 'pointer' }}
            >
              {item.name}
            </span>
            <span className="todo-item-due">{item.due}</span>
            <button
              className="todo-delete-btn"
              title="Delete"
              onClick={() => deleteItem(item.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

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
              <input
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

      {/* Detail Modal */}
      {showDetail && ReactDOM.createPortal(
        <div className="todo-modal-bg" onClick={() => setShowDetail(null)}>
          <div className="todo-modal" onClick={e => e.stopPropagation()}>
            <h5>{showDetail.name}</h5>
            <p><strong>Description:</strong> {showDetail.description}</p>
            <p><strong>Due Date:</strong> {showDetail.due}</p>
            <p><strong>Priority:</strong> {showDetail.priority}</p>
            <div className="todo-modal-actions">
              <button onClick={() => setShowDetail(null)}>Close</button>
              <button
                className="todo-delete-btn"
                onClick={() => deleteItem(showDetail.id)}
                style={{ marginLeft: '1em', background: '#e53935', color: '#fff' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TodoWidget;