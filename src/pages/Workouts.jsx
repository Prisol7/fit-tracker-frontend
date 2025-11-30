import React, { useState } from 'react';
import { addWorkout } from '../utils/api';

const Workouts = () => {
  const [formData, setFormData] = useState({
    exerciseName: '',
    weight: '',
    reps: '',
    sets: '',
    muscle: ''
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
      const result = await addWorkout(formData);
      setMessage(`Success! Workout added: ${formData.exerciseName}`);

      // Reset form
      setFormData({
        exerciseName: '',
        weight: '',
        reps: '',
        sets: '',
        muscle: ''
      });
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Workouts</h1>
      <p>Track your workouts here</p>

      <div style={{ marginTop: '30px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <h2>Add Workout</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Exercise Name</label>
            <input
              type="text"
              name="exerciseName"
              value={formData.exerciseName}
              onChange={handleChange}
              required
              placeholder="e.g., Bench Press"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Weight (lbs)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              placeholder="e.g., 185"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Reps</label>
              <input
                type="number"
                name="reps"
                value={formData.reps}
                onChange={handleChange}
                required
                placeholder="e.g., 10"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Sets</label>
              <input
                type="number"
                name="sets"
                value={formData.sets}
                onChange={handleChange}
                required
                placeholder="e.g., 3"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Muscle Group</label>
            <select
              name="muscle"
              value={formData.muscle}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            >
              <option value="">Select muscle group</option>
              <option value="Chest">Chest</option>
              <option value="Back">Back</option>
              <option value="Legs">Legs</option>
              <option value="Shoulders">Shoulders</option>
              <option value="Arms">Arms</option>
              <option value="Core">Core</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '12px',
              backgroundColor: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {isLoading ? 'Adding...' : 'Add Workout'}
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

export default Workouts;
