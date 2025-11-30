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

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Statistics</h1>
        <p>Loading statistics...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Statistics</h1>
      <p>View your progress and statistics here</p>

      {/* Time Period Selector */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setView('daily')}
          style={{
            padding: '10px 20px',
            backgroundColor: view === 'daily' ? '#007bff' : '#e0e0e0',
            color: view === 'daily' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: view === 'daily' ? 'bold' : 'normal'
          }}
        >
          Daily
        </button>
        <button
          onClick={() => setView('weekly')}
          style={{
            padding: '10px 20px',
            backgroundColor: view === 'weekly' ? '#007bff' : '#e0e0e0',
            color: view === 'weekly' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: view === 'weekly' ? 'bold' : 'normal'
          }}
        >
          Weekly
        </button>
        <button
          onClick={() => setView('overall')}
          style={{
            padding: '10px 20px',
            backgroundColor: view === 'overall' ? '#007bff' : '#e0e0e0',
            color: view === 'overall' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: view === 'overall' ? 'bold' : 'normal'
          }}
        >
          Overall
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div style={{ border: '2px solid #007bff', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Total Workouts</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{filteredWorkouts.length}</p>
        </div>

        {(view === 'weekly' || view === 'overall') && (
          <div style={{ border: '2px solid #6610f2', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6610f2' }}>Days Worked Out</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{calculateWorkoutDays(filteredWorkouts)}</p>
          </div>
        )}

        <div style={{ border: '2px solid #28a745', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>Total Food Entries</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{filteredFoods.length}</p>
        </div>

        <div style={{ border: '2px solid #ffc107', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>Total Calories</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{calculateTotalCalories(filteredFoods)}</p>
        </div>

        <div style={{ border: '2px solid #17a2b8', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#17a2b8' }}>Total Protein (g)</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{calculateTotalProtein(filteredFoods)}</p>
        </div>
      </div>

      {/* All Workouts */}
      <div style={{ marginTop: '40px' }}>
        <h2>{view.charAt(0).toUpperCase() + view.slice(1)} Workouts ({filteredWorkouts.length})</h2>
        {filteredWorkouts.length === 0 ? (
          <p style={{ color: '#666' }}>No workouts recorded for this period.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, color: '#007bff' }}>{workout.exerciseName}</h3>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(workout.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <strong>Weight:</strong> {workout.weight} lbs
                  </div>
                  <div>
                    <strong>Sets:</strong> {workout.sets} x {workout.reps}
                  </div>
                  <div>
                    <strong>Muscle:</strong> {workout.muscle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Food Entries */}
      <div style={{ marginTop: '40px' }}>
        <h2>{view.charAt(0).toUpperCase() + view.slice(1)} Food Entries ({filteredFoods.length})</h2>
        {filteredFoods.length === 0 ? (
          <p style={{ color: '#666' }}>No food entries recorded for this period.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, color: '#28a745' }}>{food.food}</h3>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(food.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <strong>Calories:</strong> {food.calories} kcal
                  </div>
                  <div>
                    <strong>Protein:</strong> {food.protein}g
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

export default Statistics;
