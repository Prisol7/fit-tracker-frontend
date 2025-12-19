import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Workouts from './pages/Workouts';
import WorkoutPlans from './pages/WorkoutPlans';
import FoodTracker from './pages/FoodTracker';
import Statistics from './pages/Statistics';
import './App.css';

const Navigation = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="logo">
          Fit Tracker
        </div>

        {currentUser && (
          <div className="nav-links">
            <Link to="/workouts">Workouts</Link>
            <Link to="/workout-plans">Plans</Link>
            <Link to="/food-tracker">Food</Link>
            <Link to="/statistics">Stats</Link>
          </div>
        )}

        <div className="auth-buttons">
          {currentUser ? (
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          ) : (
            <Link to="/login">
              <button className="btn-primary">
                Login
              </button>
            </Link>
          )}
        </div>
      </nav>

      {/* Bottom Navigation (Mobile) */}
      {currentUser && (
        <nav className="bottom-nav">
          <Link
            to="/workout-plans"
            className={`bottom-nav-item ${isActive('/workout-plans') ? 'active' : ''}`}
          >
            <span>Plans</span>
          </Link>
          <Link
            to="/workouts"
            className={`bottom-nav-item ${isActive('/workouts') ? 'active' : ''}`}
          >
            <span>Workouts</span>
          </Link>
          <Link
            to="/food-tracker"
            className={`bottom-nav-item ${isActive('/food-tracker') ? 'active' : ''}`}
          >
            <span>Food</span>
          </Link>
          <Link
            to="/statistics"
            className={`bottom-nav-item ${isActive('/statistics') ? 'active' : ''}`}
          >
            <span>Stats</span>
          </Link>
        </nav>
      )}
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/workouts"
              element={
                <ProtectedRoute>
                  <Workouts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout-plans"
              element={
                <ProtectedRoute>
                  <WorkoutPlans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/food-tracker"
              element={
                <ProtectedRoute>
                  <FoodTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <ProtectedRoute>
                  <Statistics />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
