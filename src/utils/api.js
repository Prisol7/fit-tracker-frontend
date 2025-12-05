import { auth } from '../firebase';

const API_BASE_URL = 'https://fitness-server-e2b1d5e67f36.herokuapp.com/api';

// Get the current user's Firebase token
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }
  return await user.getIdToken();
};

// Workouts
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

export const getWorkouts = async () => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/workouts`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch workouts');
  }

  return await response.json();
};

export const updateWorkout = async (id, workoutData) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/workouts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(workoutData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update workout');
  }

  return await response.json();
};

export const deleteWorkout = async (id) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/workouts/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete workout');
  }

  return await response.json();
};

// Food
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

export const getFoods = async () => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/food`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch food entries');
  }

  return await response.json();
};

export const updateFood = async (id, foodData) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/food/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(foodData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update food entry');
  }

  return await response.json();
};

export const deleteFood = async (id) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/food/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete food entry');
  }

  return await response.json();
};
