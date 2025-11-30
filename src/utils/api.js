import { auth } from '../firebase';

const API_BASE_URL = 'http://localhost:3000/api';

// Get the current user's Firebase token
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }
  return await user.getIdToken();
};

// Add a workout
export const addWorkout = async (workoutData) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/workouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(workoutData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add workout');
  }

  return await response.json();
};

// Add a food entry
export const addFood = async (foodData) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/food`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(foodData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add food entry');
  }

  return await response.json();
};
