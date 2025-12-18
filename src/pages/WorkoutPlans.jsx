import React, { useState, useEffect } from 'react';
import { getWorkoutPlans, addWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan } from '../utils/api';

const WorkoutPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    planName: '',
    assignedDays: [],
    exercises: []
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const muscleOptions = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  const muscleColors = {
    'Chest': '#FF4444',
    'Back': '#4444FF',
    'Legs': '#44FF44',
    'Shoulders': '#FF8844',
    'Arms': '#AA44FF',
    'Core': '#FFCC44'
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await getWorkoutPlans();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (editingId) {
        await updateWorkoutPlan(editingId, formData);
        setMessage(`Success! Plan updated: ${formData.planName}`);
        setEditingId(null);
      } else {
        await addWorkoutPlan(formData);
        setMessage(`Success! Plan created: ${formData.planName}`);
      }

      setFormData({
        planName: '',
        assignedDays: [],
        exercises: []
      });
      fetchPlans();
      setShowForm(false);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (plan) => {
    setFormData({
      planName: plan.planName,
      assignedDays: plan.assignedDays || [],
      exercises: plan.exercises || []
    });
    setEditingId(plan.id);
    setShowForm(true);
    setMessage('');
  };

  const handleDelete = async (id, planName) => {
    if (!window.confirm(`Are you sure you want to delete "${planName}"?`)) {
      return;
    }

    try {
      await deleteWorkoutPlan(id);
      setMessage(`Plan deleted: ${planName}`);
      fetchPlans();
    } catch (error) {
      setMessage(`Error deleting plan: ${error.message}`);
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      assignedDays: prev.assignedDays.includes(day)
        ? prev.assignedDays.filter(d => d !== day)
        : [...prev.assignedDays, day]
    }));
  };

  const handleAddExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exerciseName: '',
          muscle: 'Chest',
          targetWeight: '',
          targetReps: '',
          targetSets: '',
          order: prev.exercises.length
        }
      ]
    }));
  };

  const handleRemoveExercise = (index) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const handleExerciseChange = (index, field, value) => {
    setFormData(prev => {
      const newExercises = [...prev.exercises];
      newExercises[index] = {
        ...newExercises[index],
        [field]: value
      };
      return { ...prev, exercises: newExercises };
    });
  };

  const handleCancelEdit = () => {
    setFormData({
      planName: '',
      assignedDays: [],
      exercises: []
    });
    setEditingId(null);
    setShowForm(false);
    setMessage('');
  };

  return (
    <div className="page-content">
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '20px' }}>
        <h1 style={{ marginBottom: '12px' }}>
          <i className="fas fa-clipboard-list" style={{ color: 'var(--primary-gold)' }}></i> Workout Plans
        </h1>
        <p style={{ fontSize: '1.1em', color: 'var(--dark-text-secondary)' }}>
          Create and manage your workout routines
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className="card"
          style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: message.startsWith('Error') ? 'rgba(255, 68, 68, 0.1)' : 'rgba(68, 255, 68, 0.1)',
            borderLeft: `4px solid ${message.startsWith('Error') ? '#FF4444' : '#44FF44'}`
          }}
        >
          <p style={{ margin: 0 }}>{message}</p>
        </div>
      )}

      {/* Add Plan Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2>
              <i className={`fas ${editingId ? 'fa-edit' : 'fa-plus-circle'}`} style={{ color: 'var(--primary-gold)' }}></i>
              {' '}{editingId ? 'Edit Plan' : 'Create New Plan'}
            </h2>
            <button onClick={handleCancelEdit} className="btn-icon" style={{ background: 'var(--accent-red)' }}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Plan Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                <i className="fas fa-tag"></i> Plan Name
              </label>
              <input
                type="text"
                value={formData.planName}
                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                required
                placeholder="e.g., Chest & Arms Day"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-red)',
                  backgroundColor: 'var(--dark-surface)',
                  color: 'var(--dark-text-primary)',
                  fontSize: '1em'
                }}
              />
            </div>

            {/* Assigned Days */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                <i className="fas fa-calendar-week"></i> Assigned Days (Optional)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-red)',
                      backgroundColor: formData.assignedDays.includes(day) ? 'var(--primary-gold)' : 'var(--dark-surface)',
                      color: formData.assignedDays.includes(day) ? '#000' : 'var(--dark-text-primary)',
                      cursor: 'pointer',
                      fontWeight: formData.assignedDays.includes(day) ? 600 : 400,
                      transition: 'all 0.3s'
                    }}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercises */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontWeight: 600 }}>
                  <i className="fas fa-dumbbell"></i> Exercises
                </label>
                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.9em' }}
                >
                  <i className="fas fa-plus"></i> Add Exercise
                </button>
              </div>

              {formData.exercises.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--dark-text-secondary)' }}>
                  No exercises added yet. Click "Add Exercise" to start.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {formData.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="card"
                      style={{
                        padding: '16px',
                        borderLeft: `5px solid ${muscleColors[exercise.muscle] || 'var(--primary-gold)'}`,
                        backgroundColor: 'var(--dark-surface)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary-gold)' }}>
                          Exercise {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(index)}
                          className="btn-icon"
                          style={{ background: '#FF4444', width: '32px', height: '32px' }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        {/* Exercise Name */}
                        <input
                          type="text"
                          placeholder="Exercise Name"
                          value={exercise.exerciseName}
                          onChange={(e) => handleExerciseChange(index, 'exerciseName', e.target.value)}
                          required
                          style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-red)',
                            backgroundColor: 'var(--dark-card)',
                            color: 'var(--dark-text-primary)'
                          }}
                        />

                        {/* Muscle Group */}
                        <select
                          value={exercise.muscle}
                          onChange={(e) => handleExerciseChange(index, 'muscle', e.target.value)}
                          required
                          style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-red)',
                            backgroundColor: 'var(--dark-card)',
                            color: 'var(--dark-text-primary)'
                          }}
                        >
                          {muscleOptions.map(muscle => (
                            <option key={muscle} value={muscle}>{muscle}</option>
                          ))}
                        </select>

                        {/* Weight, Reps, Sets */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                          <input
                            type="number"
                            placeholder="Weight (lbs)"
                            value={exercise.targetWeight}
                            onChange={(e) => handleExerciseChange(index, 'targetWeight', e.target.value)}
                            required
                            style={{
                              padding: '10px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-red)',
                              backgroundColor: 'var(--dark-card)',
                              color: 'var(--dark-text-primary)'
                            }}
                          />
                          <input
                            type="number"
                            placeholder="Reps"
                            value={exercise.targetReps}
                            onChange={(e) => handleExerciseChange(index, 'targetReps', e.target.value)}
                            required
                            style={{
                              padding: '10px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-red)',
                              backgroundColor: 'var(--dark-card)',
                              color: 'var(--dark-text-primary)'
                            }}
                          />
                          <input
                            type="number"
                            placeholder="Sets"
                            value={exercise.targetSets}
                            onChange={(e) => handleExerciseChange(index, 'targetSets', e.target.value)}
                            required
                            style={{
                              padding: '10px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-red)',
                              backgroundColor: 'var(--dark-card)',
                              color: 'var(--dark-text-primary)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || formData.exercises.length === 0}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1.1em',
                opacity: (isLoading || formData.exercises.length === 0) ? 0.6 : 1,
                cursor: (isLoading || formData.exercises.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <><i className="fas fa-spinner fa-spin"></i> Saving...</>
              ) : (
                <><i className="fas fa-save"></i> {editingId ? 'Update Plan' : 'Create Plan'}</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Plans List */}
      <div>
        <h2 style={{ marginBottom: '16px' }}>
          <i className="fas fa-list"></i> Your Plans ({plans.length})
        </h2>

        {loadingPlans ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2em', color: 'var(--primary-gold)' }}></i>
            <p style={{ marginTop: '16px' }}>Loading plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-clipboard-list" style={{ fontSize: '3em', color: 'var(--dark-text-secondary)', opacity: 0.3 }}></i>
            <p style={{ marginTop: '16px', fontSize: '1.1em' }}>No workout plans yet</p>
            <p style={{ color: 'var(--dark-text-secondary)' }}>Click the + button to create your first plan!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {plans.map(plan => (
              <div key={plan.id} className="card" style={{ cursor: 'pointer', transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary-gold)' }}>
                    <i className="fas fa-clipboard-list"></i> {plan.planName}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(plan)}
                      className="btn-icon"
                      style={{ background: 'var(--primary-gold)', color: '#000' }}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id, plan.planName)}
                      className="btn-icon"
                      style={{ background: '#FF4444' }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <p style={{ color: 'var(--dark-text-secondary)', fontSize: '0.9em', marginBottom: '12px' }}>
                  <i className="fas fa-dumbbell"></i> {plan.exercises?.length || 0} exercises
                </p>

                {plan.assignedDays && plan.assignedDays.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '0.85em', color: 'var(--dark-text-secondary)', marginBottom: '8px' }}>
                      <i className="fas fa-calendar-week"></i> Assigned Days:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {plan.assignedDays.map(day => (
                        <span
                          key={day}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--primary-gold)',
                            color: '#000',
                            fontSize: '0.75em',
                            fontWeight: 600
                          }}
                        >
                          {day.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {plan.exercises && plan.exercises.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--dark-surface)', borderRadius: '4px' }}>
                    <p style={{ fontSize: '0.85em', color: 'var(--dark-text-secondary)', marginBottom: '8px' }}>Exercises:</p>
                    {plan.exercises.slice(0, 3).map((ex, idx) => (
                      <div key={idx} style={{ fontSize: '0.85em', marginBottom: '4px' }}>
                        • {ex.exerciseName} ({ex.targetWeight}lbs × {ex.targetReps} × {ex.targetSets})
                      </div>
                    ))}
                    {plan.exercises.length > 3 && (
                      <div style={{ fontSize: '0.85em', color: 'var(--primary-gold)', marginTop: '4px' }}>
                        +{plan.exercises.length - 3} more...
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowForm(!showForm)}
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
          transform: showForm ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0
        }}
      >
        <i className="fas fa-plus"></i>
      </button>
    </div>
  );
};

export default WorkoutPlans;
