import React, { useState, useEffect } from 'react';
import { addWorkout, getWorkouts, updateWorkout, deleteWorkout, getWorkoutPlans, getWorkoutPlansByDay, updateWorkoutPlanExercise } from '../utils/api';

const Workouts = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'plan' | 'history'

  // Existing workout state
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

  // Workout plan state
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [todaysPlan, setTodaysPlan] = useState(null);
  const [exerciseStates, setExerciseStates] = useState([]);
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    fetchWorkouts();
    fetchPlans();
  }, []);

  useEffect(() => {
    // Load today's plan when component mounts
    loadTodaysPlan();
  }, [availablePlans]);

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

  const fetchPlans = async () => {
    try {
      const data = await getWorkoutPlans();
      setAvailablePlans(data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setAvailablePlans([]);
    }
  };

  const loadTodaysPlan = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const planForToday = availablePlans.find(plan =>
      plan.assignedDays && plan.assignedDays.includes(today)
    );

    if (planForToday) {
      setTodaysPlan(planForToday);
      if (activeTab === 'plan' && !selectedPlan) {
        loadPlan(planForToday);
      }
    }
  };

  const loadPlan = (plan) => {
    setSelectedPlan(plan);
    const states = plan.exercises.map((ex, index) => ({
      exerciseIndex: index,
      completed: false,
      exerciseName: ex.exerciseName,
      muscle: ex.muscle,
      weight: ex.targetWeight,
      reps: ex.targetReps,
      sets: ex.targetSets,
      modified: false
    }));
    setExerciseStates(states);
    setShowPlanSelector(false);
  };

  const handleExerciseCheck = (index) => {
    setExerciseStates(prev =>
      prev.map((ex, i) =>
        i === index ? { ...ex, completed: !ex.completed } : ex
      )
    );
  };

  const handleExerciseValueChange = (index, field, value) => {
    setExerciseStates(prev =>
      prev.map((ex, i) => {
        if (i === index) {
          const original = selectedPlan.exercises[index];
          const newEx = { ...ex, [field]: parseFloat(value) || 0 };

          // Check if modified from plan defaults
          newEx.modified = (
            newEx.weight !== original.targetWeight ||
            newEx.reps !== original.targetReps ||
            newEx.sets !== original.targetSets
          );

          return newEx;
        }
        return ex;
      })
    );
  };

  const handleSaveCompletedExercises = async () => {
    const completed = exerciseStates.filter(ex => ex.completed);

    if (completed.length === 0) {
      setMessage('Please check at least one exercise to save');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Save each completed exercise to workouts collection
      for (const exercise of completed) {
        await addWorkout({
          exerciseName: exercise.exerciseName,
          weight: exercise.weight,
          reps: exercise.reps,
          sets: exercise.sets,
          muscle: exercise.muscle
        });

        // If modified, update plan defaults
        if (exercise.modified) {
          await updateWorkoutPlanExercise(
            selectedPlan.id,
            exercise.exerciseIndex,
            {
              targetWeight: exercise.weight,
              targetReps: exercise.reps,
              targetSets: exercise.sets
            }
          );
        }
      }

      setMessage(`Success! ${completed.length} exercise${completed.length > 1 ? 's' : ''} saved to history`);

      // Refresh workouts and reset checkboxes
      fetchWorkouts();
      fetchPlans(); // Refresh plans to get updated defaults

      // Reset completed checkboxes
      setExerciseStates(prev =>
        prev.map(ex => ({ ...ex, completed: false }))
      );

    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  // Filter workouts for today
  const getTodaysWorkouts = () => {
    const today = new Date().toDateString();
    return workouts.filter(w => new Date(w.createdAt).toDateString() === today);
  };

  const todaysWorkouts = getTodaysWorkouts();

  return (
    <div className="page-content">
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '20px' }}>
        <h1 style={{ marginBottom: '12px' }}>
          Workouts
        </h1>
        <p style={{ fontSize: '1.1em' }}>
          Track your exercises and build strength
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '2px solid var(--border-red)',
        paddingBottom: '8px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        {[
          { id: 'today', label: "Today's Workouts" },
          { id: 'plan', label: 'Workout Plan' },
          { id: 'history', label: 'History' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: '1 1 auto',
              minWidth: '100px',
              padding: '12px 16px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? 'var(--md-primary-container)' : 'transparent',
              color: activeTab === tab.id ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
              borderRadius: 'var(--md-shape-corner-full)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: activeTab === tab.id ? 600 : 500,
              fontSize: '0.9em',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '0.1px'
            }}
          >
            <span className="tab-label">
              {tab.label}
            </span>
          </button>
        ))}
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

      {/* Tab Content */}
      {activeTab === 'today' && (
        <div>
          <h2 style={{ marginBottom: '16px' }}>
            Today's Workouts
          </h2>

          {/* Add Workout Form */}
          {showForm && (
            <div className="card" style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>
                  {editingId ? 'Edit Workout' : 'Add Custom Exercise'}
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div>
                    <label htmlFor="exerciseName" style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: 'var(--md-on-surface)',
                      letterSpacing: '0.1px'
                    }}>
                      Exercise Name *
                    </label>
                    <input
                      type="text"
                      id="exerciseName"
                      name="exerciseName"
                      value={formData.exerciseName}
                      onChange={handleInputChange}
                      required
                      className="input"
                      placeholder="Enter exercise name (e.g., Bench Press)"
                      autoComplete="off"
                      style={{
                        fontSize: '16px',
                        padding: '14px 16px'
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="muscle" style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: 'var(--md-on-surface)',
                      letterSpacing: '0.1px'
                    }}>
                      Muscle Group *
                    </label>
                    <select
                      id="muscle"
                      name="muscle"
                      value={formData.muscle}
                      onChange={handleInputChange}
                      required
                      className="input"
                      style={{
                        fontSize: '16px',
                        padding: '14px 16px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">— Select a muscle group —</option>
                      <option value="Chest">Chest</option>
                      <option value="Back">Back</option>
                      <option value="Legs">Legs</option>
                      <option value="Shoulders">Shoulders</option>
                      <option value="Arms">Arms</option>
                      <option value="Core">Core</option>
                    </select>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '16px'
                  }}>
                    <div>
                      <label htmlFor="weight" style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: 'var(--md-on-surface)',
                        letterSpacing: '0.1px'
                      }}>
                        Weight *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          id="weight"
                          name="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.1"
                          className="input"
                          placeholder="145"
                          style={{
                            fontSize: '16px',
                            padding: '14px 16px',
                            paddingRight: '45px'
                          }}
                        />
                        <span style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--md-on-surface-variant)',
                          fontSize: '14px',
                          pointerEvents: 'none'
                        }}>lbs</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="reps" style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: 'var(--md-on-surface)',
                        letterSpacing: '0.1px'
                      }}>
                        Reps *
                      </label>
                      <input
                        type="number"
                        id="reps"
                        name="reps"
                        value={formData.reps}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="input"
                        placeholder="8"
                        style={{
                          fontSize: '16px',
                          padding: '14px 16px'
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="sets" style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: 'var(--md-on-surface)',
                        letterSpacing: '0.1px'
                      }}>
                        Sets *
                      </label>
                      <input
                        type="number"
                        id="sets"
                        name="sets"
                        value={formData.sets}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="input"
                        placeholder="3"
                        style={{
                          fontSize: '16px',
                          padding: '14px 16px'
                        }}
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
                      fontSize: '16px',
                      fontWeight: 600,
                      marginTop: '8px'
                    }}
                  >
                    {isLoading ? 'Saving...' : editingId ? 'Update Workout' : 'Add Workout'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Today's summary */}
          {!showForm && (
            <div className="card" style={{ marginBottom: '24px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5em', fontWeight: 700, color: 'var(--primary-gold)' }}>
                {todaysWorkouts.length}
              </div>
              <div style={{ fontSize: '1.1em', color: 'var(--dark-text-secondary)' }}>
                Exercise{todaysWorkouts.length !== 1 ? 's' : ''} Completed Today
              </div>
            </div>
          )}

          {/* Today's workouts list */}
          {!showForm && (todaysWorkouts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ marginTop: '16px', fontSize: '1.1em', color: 'var(--md-on-surface)' }}>No workouts yet today</p>
              <p style={{ color: 'var(--md-on-surface-variant)', marginTop: '8px' }}>Switch to "Workout Plan" tab or add a manual workout!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {todaysWorkouts.map((workout) => (
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
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85em', color: 'var(--md-on-surface-variant)', marginRight: '8px' }}>
                        {new Date(workout.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => handleEdit(workout)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.9em' }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(workout.id, workout.exerciseName)}
                        className="btn-danger"
                        style={{ padding: '6px 12px', fontSize: '0.9em' }}
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
                      backgroundColor: 'var(--md-surface-container-high)',
                      borderRadius: 'var(--md-shape-corner-small)'
                    }}>
                      <div style={{ fontSize: '0.75em', color: 'var(--md-on-surface-variant)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Weight</div>
                      <div style={{ fontSize: '1.5em', fontWeight: '600', margin: '4px 0', color: 'var(--md-on-surface)' }}>{workout.weight}</div>
                      <div style={{ fontSize: '0.85em', color: 'var(--md-on-surface-variant)' }}>lbs</div>
                    </div>
                    <div style={{
                      textAlign: 'center',
                      padding: '12px',
                      backgroundColor: 'var(--md-surface-container-high)',
                      borderRadius: 'var(--md-shape-corner-small)'
                    }}>
                      <div style={{ fontSize: '0.75em', color: 'var(--md-on-surface-variant)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sets × Reps</div>
                      <div style={{ fontSize: '1.5em', fontWeight: '600', margin: '4px 0', color: 'var(--md-on-surface)' }}>{workout.sets} × {workout.reps}</div>
                      <div style={{ fontSize: '0.85em', color: 'var(--md-on-surface-variant)' }}>per set</div>
                    </div>
                    <div style={{
                      textAlign: 'center',
                      padding: '12px',
                      backgroundColor: 'var(--md-surface-container-high)',
                      borderRadius: 'var(--md-shape-corner-small)'
                    }}>
                      <div style={{ fontSize: '0.75em', color: 'var(--md-on-surface-variant)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
                      <div style={{ fontSize: '1.5em', fontWeight: '600', margin: '4px 0', color: 'var(--md-on-surface)' }}>{workout.weight * workout.sets * workout.reps}</div>
                      <div style={{ fontSize: '0.85em', color: 'var(--md-on-surface-variant)' }}>lbs</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'plan' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>
              Workout Plan
            </h2>
            <div style={{ fontSize: '0.9em', color: 'var(--md-on-surface-variant)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
          </div>

          {selectedPlan ? (
            <div>
              {/* Plan Header */}
              <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--md-primary)' }}>
                      {selectedPlan.planName}
                    </h3>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.9em', color: 'var(--md-on-surface-variant)' }}>
                      {selectedPlan.exercises.length} exercises • Check off as you complete them
                    </p>
                  </div>
                </div>
              </div>

              {/* Exercise List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {exerciseStates.map((exercise, index) => (
                  <div
                    key={index}
                    className="card"
                    style={{
                      borderLeft: `5px solid ${muscleColors[exercise.muscle] || 'var(--primary-gold)'}`,
                      opacity: exercise.completed ? 0.7 : 1,
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={exercise.completed}
                        onChange={() => handleExerciseCheck(index)}
                        style={{
                          width: '24px',
                          height: '24px',
                          accentColor: 'var(--primary-gold)',
                          cursor: 'pointer'
                        }}
                      />

                      {/* Exercise Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div>
                            <h3 style={{ margin: 0, marginBottom: '4px', textDecoration: exercise.completed ? 'line-through' : 'none' }}>
                              {exercise.exerciseName}
                            </h3>
                            <span style={{
                              fontSize: '0.85em',
                              backgroundColor: muscleColors[exercise.muscle] || 'var(--primary-gold)',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '12px'
                            }}>
                              {exercise.muscle}
                            </span>
                          </div>
                          {exercise.modified && (
                            <span style={{
                              fontSize: '0.8em',
                              color: 'var(--primary-gold)',
                              backgroundColor: 'rgba(212, 175, 55, 0.1)',
                              padding: '4px 8px',
                              borderRadius: '4px'
                            }}>
                              <i className="fas fa-edit"></i> Modified
                            </span>
                          )}
                        </div>

                        {/* Editable Values */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8em', color: 'var(--dark-text-secondary)', marginBottom: '4px' }}>
                              Weight (lbs)
                            </label>
                            <input
                              type="number"
                              value={exercise.weight}
                              onChange={(e) => handleExerciseValueChange(index, 'weight', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-red)',
                                backgroundColor: 'var(--dark-surface)',
                                color: 'var(--dark-text-primary)',
                                fontSize: '1em'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8em', color: 'var(--dark-text-secondary)', marginBottom: '4px' }}>
                              Reps
                            </label>
                            <input
                              type="number"
                              value={exercise.reps}
                              onChange={(e) => handleExerciseValueChange(index, 'reps', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-red)',
                                backgroundColor: 'var(--dark-surface)',
                                color: 'var(--dark-text-primary)',
                                fontSize: '1em'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8em', color: 'var(--dark-text-secondary)', marginBottom: '4px' }}>
                              Sets
                            </label>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => handleExerciseValueChange(index, 'sets', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-red)',
                                backgroundColor: 'var(--dark-surface)',
                                color: 'var(--dark-text-primary)',
                                fontSize: '1em'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveCompletedExercises}
                disabled={isLoading || exerciseStates.filter(ex => ex.completed).length === 0}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '1.1em',
                  opacity: (isLoading || exerciseStates.filter(ex => ex.completed).length === 0) ? 0.6 : 1,
                  cursor: (isLoading || exerciseStates.filter(ex => ex.completed).length === 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                ) : (
                  <><i className="fas fa-save"></i> Save Completed Exercises ({exerciseStates.filter(ex => ex.completed).length})</>
                )}
              </button>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <i className="fas fa-clipboard-list" style={{ fontSize: '3em', color: 'var(--dark-text-secondary)', opacity: 0.3 }}></i>
              <p style={{ marginTop: '16px', fontSize: '1.1em' }}>
                {todaysPlan ? 'No plan loaded' : `No plan assigned for ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}`}
              </p>
              <p style={{ color: 'var(--dark-text-secondary)' }}>Click the + button to select a plan</p>
            </div>
          )}

          {/* Plan Selector Modal */}
          {showPlanSelector && (
            <div style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setShowPlanSelector(false)}
            >
              <div className="card" style={{ maxWidth: '500px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0 }}>
                    <i className="fas fa-clipboard-list"></i> Select Workout Plan
                  </h2>
                  <button
                    onClick={() => setShowPlanSelector(false)}
                    className="btn-icon"
                    style={{ background: 'var(--accent-red)' }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {availablePlans.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>No workout plans available</p>
                    <a href="/workout-plans" style={{ color: 'var(--primary-gold)' }}>
                      <i className="fas fa-plus"></i> Create a plan
                    </a>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {availablePlans.map(plan => (
                      <div
                        key={plan.id}
                        className="card"
                        onClick={() => loadPlan(plan)}
                        style={{
                          cursor: 'pointer',
                          padding: '16px',
                          backgroundColor: selectedPlan?.id === plan.id ? 'rgba(212, 175, 55, 0.1)' : 'var(--dark-surface)',
                          border: selectedPlan?.id === plan.id ? '2px solid var(--primary-gold)' : '1px solid var(--border-red)'
                        }}
                      >
                        <h3 style={{ margin: 0, marginBottom: '8px', color: 'var(--primary-gold)' }}>
                          {plan.planName}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.9em', color: 'var(--dark-text-secondary)' }}>
                          <i className="fas fa-dumbbell"></i> {plan.exercises?.length || 0} exercises
                        </p>
                        {plan.assignedDays && plan.assignedDays.length > 0 && (
                          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {plan.assignedDays.map(day => (
                              <span
                                key={day}
                                style={{
                                  padding: '2px 8px',
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
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
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
      )}

      {/* Floating Action Button - Context Aware */}
      {(activeTab === 'history' && !showForm) && (
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

      {activeTab === 'plan' && (
        <button
          onClick={() => setShowPlanSelector(true)}
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
          <i className="fas fa-list"></i>
        </button>
      )}

      {activeTab === 'today' && !showForm && (
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
    </div>
  );
};

export default Workouts;
