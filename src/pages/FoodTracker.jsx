import React, { useState } from 'react';
import { addFood } from '../utils/api';

const FoodTracker = () => {
  const [formData, setFormData] = useState({
    food: '',
    calories: '',
    protein: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const result = await addFood(formData);
      setMessage(`Success! Food entry added: ${formData.food}`);

      // Reset form
      setFormData({
        food: '',
        calories: '',
        protein: ''
      });
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Food Tracker</h1>
      <p>Track your meals and calories here</p>

      <div style={{ marginTop: '30px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <h2>Add Food Entry</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Food Item</label>
            <input
              type="text"
              name="food"
              value={formData.food}
              onChange={handleChange}
              required
              placeholder="e.g., Grilled Chicken Breast"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Calories (kcal)</label>
              <input
                type="number"
                name="calories"
                value={formData.calories}
                onChange={handleChange}
                required
                placeholder="e.g., 165"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Protein (g)</label>
              <input
                type="number"
                name="protein"
                value={formData.protein}
                onChange={handleChange}
                required
                placeholder="e.g., 31"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '12px',
              backgroundColor: isLoading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {isLoading ? 'Adding...' : 'Add Food Entry'}
          </button>
        </form>

        {message && (
          <p style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: message.startsWith('Error') ? '#ffebee' : '#e8f5e9',
            color: message.startsWith('Error') ? '#c62828' : '#2e7d32',
            borderRadius: '4px'
          }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FoodTracker;
