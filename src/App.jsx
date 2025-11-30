import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Workouts from './pages/Workouts';
import FoodTracker from './pages/FoodTracker';
import Statistics from './pages/Statistics';
import './App.css';

const Navigation = () => {
  const { currentUser, logout } = useAuth();

  return (
    <nav style={{ padding: '10px', background: '#f0f0f0', marginBottom: '20px' }}>
      <Link to="/" style={{ marginRight: '15px' }}>Home</Link>

      {currentUser ? (
        <>
          <Link to="/workouts" style={{ marginRight: '15px' }}>Workouts</Link>
          <Link to="/food-tracker" style={{ marginRight: '15px' }}>Food Tracker</Link>
          <Link to="/statistics" style={{ marginRight: '15px' }}>Statistics</Link>
          <button onClick={logout} style={{ marginLeft: '15px', cursor: 'pointer' }}>
            Logout
          </button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
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
