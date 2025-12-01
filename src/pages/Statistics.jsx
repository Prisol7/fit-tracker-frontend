import React, { useState, useEffect } from 'react';
import { getWorkouts, getFoods } from '../utils/api';

const Statistics = () => {
  const [workouts, setWorkouts] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('daily'); // 'daily', 'weekly', 'overall'

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [workoutData, foodData] = await Promise.all([
        getWorkouts(),
        getFoods()
      ]);
      setWorkouts(workoutData.workouts || []);
      setFoods(foodData.foods || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data by time period
  const filterByPeriod = (items, period) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return items.filter(item => {
      const itemDate = new Date(item.createdAt);

      if (period === 'daily') {
        const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
        return itemDay.getTime() === today.getTime();
      } else if (period === 'weekly') {
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        return itemDate >= oneWeekAgo;
      }
      return true; // overall
    });
  };

  const filteredWorkouts = filterByPeriod(workouts, view);
  const filteredFoods = filterByPeriod(foods, view);

  const calculateTotalCalories = (foodList) => {
    return foodList.reduce((sum, food) => sum + food.calories, 0);
  };

  const calculateTotalProtein = (foodList) => {
    return foodList.reduce((sum, food) => sum + food.protein, 0);
  };

  const calculateWorkoutDays = (workoutList) => {
    const uniqueDates = new Set();
    workoutList.forEach(workout => {
      const date = new Date(workout.createdAt);
      const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      uniqueDates.add(dateStr);
    });
    return uniqueDates.size;
  };

  const calculateTotalVolume = (workoutList) => {
    return workoutList.reduce((sum, workout) =>
      sum + (workout.weight * workout.sets * workout.reps), 0
    );
  };

  if (loading) {
    return (
      <div className="page-content" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '3em', color: 'var(--primary-pink)' }}></i>
        <p style={{ marginTop: '20px', fontSize: '1.2em' }}>Loading statistics...</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Workouts',
      value: filteredWorkouts.length,
      icon: 'fa-dumbbell',
      color: 'var(--primary-pink)'
    },
    {
      label: view === 'daily' ? 'Today\'s Volume' : 'Total Volume',
      value: `${calculateTotalVolume(filteredWorkouts).toLocaleString()} lbs`,
      icon: 'fa-weight-hanging',
      color: 'var(--secondary-blue)'
    },
    {
      label: 'Total Calories',
      value: calculateTotalCalories(filteredFoods).toLocaleString(),
      icon: 'fa-fire',
      color: 'var(--tertiary-mint)'
    },
    {
      label: 'Total Protein',
      value: `${calculateTotalProtein(filteredFoods)}g`,
      icon: 'fa-drumstick-bite',
      color: 'var(--supporting-peach)'
    }
  ];

  if (view !== 'daily') {
    stats.splice(1, 0, {
      label: 'Days Active',
      value: calculateWorkoutDays(filteredWorkouts),
      icon: 'fa-calendar-check',
      color: '#9370DB'
    });
  }

  return (
    <div className="page-content">
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '20px' }}>
        <h1 style={{ marginBottom: '12px' }}>
          <i className="fas fa-chart-line" style={{ color: 'var(--tertiary-mint)' }}></i> Statistics
        </h1>
        <p style={{ fontSize: '1.1em' }}>
          Track your progress and achievements
        </p>
      </div>

      {/* Time Period Selector */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        borderRadius: 'var(--border-radius-button)',
        backgroundColor: 'var(--dark-surface)',
        padding: '4px'
      }}>
        <button
          onClick={() => setView('daily')}
          className={view === 'daily' ? 'btn-primary' : 'btn-outline'}
          style={{
            flex: 1,
            borderRadius: 'var(--border-radius-button)',
            border: 'none'
          }}
        >
          <i className="fas fa-sun" style={{ marginRight: '4px' }}></i>
          Daily
        </button>
        <button
          onClick={() => setView('weekly')}
          className={view === 'weekly' ? 'btn-primary' : 'btn-outline'}
          style={{
            flex: 1,
            borderRadius: 'var(--border-radius-button)',
            border: 'none'
          }}
        >
          <i className="fas fa-calendar-week" style={{ marginRight: '4px' }}></i>
          Weekly
        </button>
        <button
          onClick={() => setView('overall')}
          className={view === 'overall' ? 'btn-primary' : 'btn-outline'}
          style={{
            flex: 1,
            borderRadius: 'var(--border-radius-button)',
            border: 'none'
          }}
        >
          <i className="fas fa-infinity" style={{ marginRight: '4px' }}></i>
          Overall
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px',
        marginBottom: '40px'
      }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            className="card"
            style={{
              textAlign: 'center',
              borderTop: `4px solid ${stat.color}`,
              padding: '24px 16px'
            }}
          >
            <i className={`fas ${stat.icon}`} style={{ fontSize: '2em', color: stat.color, marginBottom: '12px' }}></i>
            <h3 style={{ fontSize: '1.8em', margin: '8px 0', color: stat.color }}>{stat.value}</h3>
            <p style={{ fontSize: '0.9em' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Workouts Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '24px' }}>
          <i className="fas fa-dumbbell" style={{ color: 'var(--primary-pink)', marginRight: '8px' }}></i>
          {view.charAt(0).toUpperCase() + view.slice(1)} Workouts ({filteredWorkouts.length})
        </h2>

        {filteredWorkouts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-dumbbell" style={{ fontSize: '3em', color: 'var(--light-text-secondary)', opacity: 0.3 }}></i>
            <p style={{ marginTop: '16px' }}>No workouts recorded for this period</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="card"
                style={{
                  borderLeft: '4px solid var(--primary-pink)',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-pink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="fas fa-dumbbell" style={{ color: 'white' }}></i>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1em' }}>{workout.exerciseName}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85em' }}>
                        {workout.weight} lbs × {workout.sets} sets × {workout.reps} reps
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '0.85em',
                      color: 'var(--light-text-secondary)',
                      backgroundColor: 'var(--light-surface)',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      marginBottom: '4px'
                    }}>
                      {workout.muscle}
                    </div>
                    <div style={{ fontSize: '0.75em', color: 'var(--light-text-secondary)' }}>
                      {new Date(workout.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Food Entries Section */}
      <div>
        <h2 style={{ marginBottom: '24px' }}>
          <i className="fas fa-utensils" style={{ color: 'var(--secondary-blue)', marginRight: '8px' }}></i>
          {view.charAt(0).toUpperCase() + view.slice(1)} Food Entries ({filteredFoods.length})
        </h2>

        {filteredFoods.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-utensils" style={{ fontSize: '3em', color: 'var(--light-text-secondary)', opacity: 0.3 }}></i>
            <p style={{ marginTop: '16px' }}>No food entries recorded for this period</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className="card"
                style={{
                  borderLeft: '4px solid var(--secondary-blue)',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--secondary-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="fas fa-utensils" style={{ color: 'white' }}></i>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1em' }}>{food.food}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85em' }}>
                        {food.calories} cal • {food.protein}g protein
                      </p>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75em', color: 'var(--light-text-secondary)', textAlign: 'right' }}>
                    <div>{new Date(food.createdAt).toLocaleDateString()}</div>
                    <div>{new Date(food.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motivational Footer */}
      {(filteredWorkouts.length > 0 || filteredFoods.length > 0) && (
        <div style={{
          textAlign: 'center',
          padding: '32px 20px',
          borderRadius: 'var(--border-radius-container)',
          background: 'linear-gradient(135deg, var(--tertiary-mint), var(--secondary-blue))',
          color: 'white',
          marginTop: '40px'
        }}>
          <h2 style={{ color: 'white', marginBottom: '8px' }}>
            <i className="fas fa-trophy"></i> Keep Going!
          </h2>
          <p style={{ color: 'white', fontSize: '1em' }}>
            You're making great progress on your fitness journey
          </p>
        </div>
      )}
    </div>
  );
};

export default Statistics;
