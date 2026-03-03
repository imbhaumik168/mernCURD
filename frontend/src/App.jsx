import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = '/api/items';

function App() {
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({ name: '', description: '', priority: 'Medium' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get(API_URL);
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error.response?.data || error.message);
            console.log('Full Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, formData);
                setEditingId(null);
            } else {
                await axios.post(API_URL, formData);
            }
            setFormData({ name: '', description: '', priority: 'Medium' });
            fetchItems();
        } catch (error) {
            console.error('Error saving item:', error.response?.data || error.message);
            alert(`Error: ${error.response?.data?.message || 'Failed to save item'}`);
        }
    };

    const handleEdit = (item) => {
        setFormData({ name: item.name, description: item.description, priority: item.priority });
        setEditingId(item._id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchItems();
        } catch (error) {
            console.error('Error deleting item:', error.response?.data || error.message);
        }
    };

    return (
        <div className="container">
            <h1>Task Master MERN</h1>

            <div className="glass-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Item Name</label>
                        <input
                            type="text"
                            placeholder="Enter item name..."
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            placeholder="Enter description..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Priority</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <button type="submit" className="btn">
                        {editingId ? 'Update Item' : 'Add Item'}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            className="btn btn-delete"
                            style={{ marginLeft: '0.5rem' }}
                            onClick={() => { setEditingId(null); setFormData({ name: '', description: '', priority: 'Medium' }); }}
                        >
                            Cancel
                        </button>
                    )}
                </form>
            </div>

            <div className="item-list">
                {Array.isArray(items) && items.map((item) => (
                    <div key={item._id} className="glass-card item-card">
                        <div className="item-info">
                            <h3>{item.name} <span className={`badge badge-${item.priority}`}>{item.priority}</span></h3>
                            <p>{item.description}</p>
                        </div>
                        <div className="actions">
                            <button className="btn" onClick={() => handleEdit(item)}>Edit</button>
                            <button className="btn btn-delete" onClick={() => handleDelete(item._id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
