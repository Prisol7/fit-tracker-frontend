import React, { useState, useEffect } from 'react';
import { addWorkout, getWorkouts, updateWorkout, deleteWorkout } from '../utils/api';

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
  const [workouts, setWorkouts] = useState([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      console.log('Fetching workouts...');
      const data = await getWorkouts();
      console.log('Workouts received:', data);
      setWorkouts(data.workouts || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setWorkouts([]);
    } finally {
      setLoadingWorkouts(false);
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
        await updateWorkout(editingId, formData);
        setMessage(`Success! Workout updated: ${formData.exerciseName}`);
        setEditingId(null);
      } else {
        await addWorkout(formData);
        setMessage(`Success! Workout added: ${formData.exerciseName}`);
      }

      // Reset form
      setFormData({
        exerciseName: '',
        weight: '',
        reps: '',
        sets: '',
        muscle: ''
      });

      // Refresh workout list
      fetchWorkouts();
      setShowForm(false);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (workout) => {
    setFormData({
      exerciseName: workout.exerciseName,
      weight: workout.weight.toString(),
      reps: workout.reps.toString(),
      sets: workout.sets.toString(),
      muscle: workout.muscle
    });
    setEditingId(workout.id);
    setShowForm(true);
    setMessage('');
  };

  const handleDelete = async (id, exerciseName) => {
    if (!window.confirm(`Are you sure you want to delete "${exerciseName}"?`)) {
      return;
    }

    try {
      await deleteWorkout(id);
      setMessage(`Workout deleted: ${exerciseName}`);
      fetchWorkouts();
    } catch (error) {
      setMessage(`Error deleting workout: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      exerciseName: '',
      weight: '',
      reps: '',
      sets: '',
      muscle: ''
    });
    setEditingId(null);
    setShowForm(false);
    setMessage('');
  };

  const muscleIcons = {
    'Chest': 'fa-heart',
    'Back': 'fa-shield-alt',
    'Legs': 'fa-running',
    'Shoulders': 'fa-user-shield',
    'Arms': 'fa-hand-rock',
    'Core': 'fa-medal'
  };

  const muscleColors = {
    'Chest': 'var(--primary-red)',
    'Back': 'var(--secondary-gold)',
    'Legs': 'var(--tertiary-crimson)',
    'Shoulders': 'var(--supporting-bronze)',
    'Arms': '#A52A2A',
    'Core': '#8B7355'
  };

  return (
    <div className="page-content">
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '20px' }}>
        <h1 style={{ marginBottom: '12px' }}>
          <i className="fas fa-dumbbell" style={{ color: 'var(--primary-red)' }}></i> Workouts
        </h1>
        <p style={{ fontSize: '1.1em' }}>
          Track your exercises and build strength
        </p>
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

      {/* Add Workout Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0 }}>
              <i className={`fas ${editingId ? 'fa-edit' : 'fa-plus-circle'}`} style={{ color: 'var(--secondary-gold)', marginRight: '8px' }}></i>
              {editingId ? 'Edit Workout' : 'Add Workout'}
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
                <i className="fas fa-running" style={{ marginRight: '8px', color: 'var(--secondary-gold)' }}></i>
                Exercise Name
              </label>
              <input
                type="text"
                name="exerciseName"
                value={formData.exerciseName}
                onChange={handleChange}
                required
                placeholder="e.g., Bench Press"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                <i className="fas fa-weight-hanging" style={{ marginRight: '8px', color: 'var(--primary-red)' }}></i>
                Weight (lbs)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                placeholder="e.g., 185"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  <i className="fas fa-redo" style={{ marginRight: '8px', color: 'var(--tertiary-crimson)' }}></i>
                  Reps
                </label>
                <input
                  type="number"
                  name="reps"
                  value={formData.reps}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 10"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  <i className="fas fa-layer-group" style={{ marginRight: '8px', color: 'var(--supporting-bronze)' }}></i>
                  Sets
                </label>
                <input
                  type="number"
                  name="sets"
                  value={formData.sets}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 3"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                <i className="fas fa-bullseye" style={{ marginRight: '8px', color: 'var(--secondary-gold)' }}></i>
                Muscle Group
              </label>
              <select
                name="muscle"
                value={formData.muscle}
                onChange={handleChange}
                required
              >
                <option value="">Select muscle group</option>
                <option value="Chest">💪 Chest</option>
                <option value="Back">🛡️ Back</option>
                <option value="Legs">🦵 Legs</option>
                <option value="Shoulders">🏋️ Shoulders</option>
                <option value="Arms">💪 Arms</option>
                <option value="Core">🎯 Core</option>
              </select>
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
                  {editingId ? 'Update Workout' : 'Add Workout'}
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

      {/* Workout History */}
      <div>
        <h2 style={{ marginBottom: '24px' }}>
          <i className="fas fa-history" style={{ color: 'var(--secondary-gold)', marginRight: '8px' }}></i>
          Workout History
        </h2>

        {loadingWorkouts ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2em', color: 'var(--secondary-gold)' }}></i>
            <p style={{ marginTop: '16px' }}>Loading workouts...</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-dumbbell" style={{ fontSize: '3em', color: 'var(--light-text-secondary)', opacity: 0.3 }}></i>
            <p style={{ marginTop: '16px', fontSize: '1.1em' }}>No workouts recorded yet</p>
            <p>Click the + button to add your first workout!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="card"
                style={{
                  borderLeft: `5px solid ${muscleColors[workout.muscle] || 'var(--primary-pink)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: muscleColors[workout.muscle] || 'var(--primary-pink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className={`fas ${muscleIcons[workout.muscle] || 'fa-dumbbell'}`} style={{ fontSize: '1.3em', color: 'white' }}></i>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, marginBottom: '4px' }}>{workout.exerciseName}</h3>
                      <span style={{
                        fontSize: '0.85em',
                        color: 'var(--dark-text-secondary)',
                        backgroundColor: 'var(--dark-surface)',
                        padding: '4px 12px',
                        borderRadius: '12px'
                      }}>
                        {workout.muscle}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85em', color: 'var(--light-text-secondary)', marginRight: '8px' }}>
                      <i className="fas fa-calendar" style={{ marginRight: '4px' }}></i>
                      {new Date(workout.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleEdit(workout)}
                      className="btn-icon"
                      title="Edit workout"
                      style={{ fontSize: '1em' }}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(workout.id, workout.exerciseName)}
                      className="btn-icon"
                      title="Delete workout"
                      style={{ fontSize: '1em', color: '#d32f2f' }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginTop: '16px'
                }}>
                  <div style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: 'var(--dark-surface)',
                    borderRadius: 'var(--border-radius-element)'
                  }}>
                    <i className="fas fa-weight-hanging" style={{ color: 'var(--primary-red)', marginBottom: '4px' }}></i>
                    <div style={{ fontSize: '1.3em', fontWeight: '700', margin: '4px 0' }}>{workout.weight}</div>
                    <div style={{ fontSize: '0.85em', color: 'var(--dark-text-secondary)' }}>lbs</div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: 'var(--dark-surface)',
                    borderRadius: 'var(--border-radius-element)'
                  }}>
                    <i className="fas fa-redo" style={{ color: 'var(--secondary-gold)', marginBottom: '4px' }}></i>
                    <div style={{ fontSize: '1.3em', fontWeight: '700', margin: '4px 0' }}>{workout.sets} × {workout.reps}</div>
                    <div style={{ fontSize: '0.85em', color: 'var(--dark-text-secondary)' }}>sets × reps</div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: 'var(--dark-surface)',
                    borderRadius: 'var(--border-radius-element)'
                  }}>
                    <i className="fas fa-calculator" style={{ color: 'var(--tertiary-crimson)', marginBottom: '4px' }}></i>
                    <div style={{ fontSize: '1.3em', fontWeight: '700', margin: '4px 0' }}>{workout.weight * workout.sets * workout.reps}</div>
                    <div style={{ fontSize: '0.85em', color: 'var(--dark-text-secondary)' }}>total lbs</div>
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

export default Workouts;
