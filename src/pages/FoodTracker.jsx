import React, { useState, useEffect } from 'react';
import { addFood, getFoods, updateFood, deleteFood } from '../utils/api';

const FoodTracker = () => {
  const [formData, setFormData] = useState({
    food: '',
    calories: '',
    protein: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foods, setFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      console.log('Fetching foods...');
      const data = await getFoods();
      console.log('Foods received:', data);
      setFoods(data.foods || []);
    } catch (error) {
      console.error('Error fetching foods:', error);
      setFoods([]);
    } finally {
      setLoadingFoods(false);
    }
  };

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
      if (editingId) {
        await updateFood(editingId, formData);
        setMessage(`Success! Food entry updated: ${formData.food}`);
        setEditingId(null);
      } else {
        await addFood(formData);
        setMessage(`Success! Food entry added: ${formData.food}`);
      }

      // Reset form
      setFormData({
        food: '',
        calories: '',
        protein: ''
      });

      // Refresh food list
      fetchFoods();
      setShowForm(false);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (food) => {
    setFormData({
      food: food.food,
      calories: food.calories.toString(),
      protein: food.protein.toString()
    });
    setEditingId(food.id);
    setShowForm(true);
    setMessage('');
  };

  const handleDelete = async (id, foodName) => {
    if (!window.confirm(`Are you sure you want to delete "${foodName}"?`)) {
      return;
    }

    try {
      await deleteFood(id);
      setMessage(`Food entry deleted: ${foodName}`);
      fetchFoods();
    } catch (error) {
      setMessage(`Error deleting food entry: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      food: '',
      calories: '',
      protein: ''
    });
    setEditingId(null);
    setShowForm(false);
    setMessage('');
  };

  // Calculate daily totals
  const todayFoods = foods.filter(food => {
    const foodDate = new Date(food.createdAt);
    const today = new Date();
    return foodDate.toDateString() === today.toDateString();
  });

  const totalCalories = todayFoods.reduce((sum, food) => sum + food.calories, 0);
  const totalProtein = todayFoods.reduce((sum, food) => sum + food.protein, 0);

  return (
    <div className="page-content">
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '20px' }}>
        <h1 style={{ marginBottom: '12px' }}>
          <i className="fas fa-utensils" style={{ color: 'var(--secondary-gold)' }}></i> Food Tracker
        </h1>
        <p style={{ fontSize: '1.1em' }}>
          Monitor your nutrition and stay on track
        </p>
      </div>

      {/* Daily Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div className="card" style={{
          textAlign: 'center',
          borderTop: '4px solid var(--primary-red)'
        }}>
          <i className="fas fa-fire" style={{ fontSize: '2em', color: 'var(--primary-red)', marginBottom: '8px' }}></i>
          <h3 style={{ fontSize: '2em', margin: '8px 0', color: 'var(--primary-red)' }}>{totalCalories}</h3>
          <p style={{ fontSize: '0.9em' }}>Calories Today</p>
        </div>
        <div className="card" style={{
          textAlign: 'center',
          borderTop: '4px solid var(--secondary-gold)'
        }}>
          <i className="fas fa-drumstick-bite" style={{ fontSize: '2em', color: 'var(--secondary-gold)', marginBottom: '8px' }}></i>
          <h3 style={{ fontSize: '2em', margin: '8px 0', color: 'var(--secondary-gold)' }}>{totalProtein}g</h3>
          <p style={{ fontSize: '0.9em' }}>Protein Today</p>
        </div>
      </div>

      {/* Floating Action Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '32px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            fontSize: '1.5em',
            boxShadow: 'var(--shadow-heavy)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
        >
          <i className="fas fa-plus"></i>
        </button>
      )}

      {/* Add Food Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0 }}>
              <i className={`fas ${editingId ? 'fa-edit' : 'fa-plus-circle'}`} style={{ color: 'var(--secondary-gold)', marginRight: '8px' }}></i>
              {editingId ? 'Edit Food Entry' : 'Add Food Entry'}
            </h2>
            <button
              onClick={handleCancelEdit}
              className="btn-icon"
              style={{ fontSize: '1.2em' }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                <i className="fas fa-apple-alt" style={{ marginRight: '8px', color: 'var(--secondary-gold)' }}></i>
                Food Item
              </label>
              <input
                type="text"
                name="food"
                value={formData.food}
                onChange={handleChange}
                required
                placeholder="e.g., Grilled Chicken Breast"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  <i className="fas fa-fire" style={{ marginRight: '8px', color: 'var(--primary-red)' }}></i>
                  Calories
                </label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 165"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  <i className="fas fa-drumstick-bite" style={{ marginRight: '8px', color: 'var(--tertiary-crimson)' }}></i>
                  Protein (g)
                </label>
                <input
                  type="number"
                  name="protein"
                  value={formData.protein}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 31"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.1em',
                marginTop: '8px'
              }}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                  {editingId ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <i className="fas fa-check" style={{ marginRight: '8px' }}></i>
                  {editingId ? 'Update Food Entry' : 'Add Food Entry'}
                </>
              )}
            </button>
          </form>

          {message && (
            <div style={{
              marginTop: '20px',
              padding: '12px 16px',
              backgroundColor: message.startsWith('Error') ? '#ffebee' : '#e8f5e9',
              color: message.startsWith('Error') ? '#c62828' : '#2e7d32',
              borderRadius: 'var(--border-radius-input)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className={`fas ${message.startsWith('Error') ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
              <span>{message}</span>
            </div>
          )}
        </div>
      )}

      {/* Food History */}
      <div>
        <h2 style={{ marginBottom: '24px' }}>
          <i className="fas fa-history" style={{ color: 'var(--secondary-gold)', marginRight: '8px' }}></i>
          Food History
        </h2>

        {loadingFoods ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2em', color: 'var(--secondary-gold)' }}></i>
            <p style={{ marginTop: '16px' }}>Loading food entries...</p>
          </div>
        ) : foods.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-utensils" style={{ fontSize: '3em', color: 'var(--light-text-secondary)', opacity: 0.3 }}></i>
            <p style={{ marginTop: '16px', fontSize: '1.1em' }}>No food entries recorded yet</p>
            <p>Click the + button to add your first meal!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {foods.map((food) => (
              <div
                key={food.id}
                className="card"
                style={{
                  borderLeft: '5px solid var(--secondary-gold)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--secondary-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="fas fa-utensils" style={{ fontSize: '1.3em', color: 'black' }}></i>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, marginBottom: '4px' }}>{food.food}</h3>
                      <span style={{
                        fontSize: '0.85em',
                        color: 'var(--dark-text-secondary)',
                        backgroundColor: 'var(--dark-surface)',
                        padding: '4px 12px',
                        borderRadius: '12px'
                      }}>
                        <i className="fas fa-clock" style={{ marginRight: '4px' }}></i>
                        {new Date(food.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85em', color: 'var(--light-text-secondary)', marginRight: '8px' }}>
                      <i className="fas fa-calendar" style={{ marginRight: '4px' }}></i>
                      {new Date(food.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleEdit(food)}
                      className="btn-icon"
                      title="Edit food entry"
                      style={{ fontSize: '1em' }}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(food.id, food.food)}
                      className="btn-icon"
                      title="Delete food entry"
                      style={{ fontSize: '1em', color: '#d32f2f' }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  marginTop: '16px'
                }}>
                  <div style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: 'var(--dark-surface)',
                    borderRadius: 'var(--border-radius-element)'
                  }}>
                    <i className="fas fa-fire" style={{ color: 'var(--primary-red)', marginBottom: '4px' }}></i>
                    <div style={{ fontSize: '1.3em', fontWeight: '700', margin: '4px 0' }}>{food.calories}</div>
                    <div style={{ fontSize: '0.85em', color: 'var(--dark-text-secondary)' }}>calories</div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: 'var(--dark-surface)',
                    borderRadius: 'var(--border-radius-element)'
                  }}>
                    <i className="fas fa-drumstick-bite" style={{ color: 'var(--tertiary-crimson)', marginBottom: '4px' }}></i>
                    <div style={{ fontSize: '1.3em', fontWeight: '700', margin: '4px 0' }}>{food.protein}g</div>
                    <div style={{ fontSize: '0.85em', color: 'var(--dark-text-secondary)' }}>protein</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodTracker;
