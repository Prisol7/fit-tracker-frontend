import { auth } from '../firebase';

// API Configuration - Toggle between local and production
// Comment out one of these lines to switch environments:

const API_BASE_URL = 'http://localhost:3000/api';  // LOCAL DEVELOPMENT
//const API_BASE_URL = 'https://fitness-server-e2b1d5e67f36.herokuapp.com/api';  // PRODUCTION

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

// Workout Plans
export const getWorkoutPlans = async () => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/workout-plans`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch workout plans');
  }

  return await response.json();
};

export const getWorkoutPlan = async (id) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/workout-plans/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch workout plan');
  }

  return await response.json();
};

export const getWorkoutPlansByDay = async (dayName) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/workout-plans/day/${dayName}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch plans for day');
  }

  return await response.json();
};

export const addWorkoutPlan = async (planData) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/workout-plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(planData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create workout plan');
  }

  return await response.json();
};

export const updateWorkoutPlan = async (id, planData) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/workout-plans/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(planData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update workout plan');
  }

  return await response.json();
};

export const updateWorkoutPlanExercise = async (planId, exerciseIndex, exerciseData) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/workout-plans/${planId}/exercises/${exerciseIndex}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(exerciseData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update exercise defaults');
  }

  return await response.json();
};

export const deleteWorkoutPlan = async (id) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/workout-plans/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete workout plan');
  }

  return await response.json();
};
