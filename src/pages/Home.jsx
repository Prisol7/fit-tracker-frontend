import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  const features = [
    {
      icon: 'fa-dumbbell',
      title: 'Track Workouts',
      description: 'Log your exercises, sets, and reps',
      color: 'var(--primary-pink)',
      link: '/workouts'
    },
    {
      icon: 'fa-utensils',
      title: 'Food Tracker',
      description: 'Monitor calories and protein intake',
      color: 'var(--secondary-blue)',
      link: '/food-tracker'
    },
    {
      icon: 'fa-chart-line',
      title: 'Statistics',
      description: 'View your progress and trends',
      color: 'var(--tertiary-mint)',
      link: '/statistics'
    }
  ];

  const stats = [
    { label: 'Workouts Logged', value: '0', icon: 'fa-fire', color: 'var(--primary-pink)' },
    { label: 'Calories Tracked', value: '0', icon: 'fa-apple-alt', color: 'var(--secondary-blue)' },
    { label: 'Days Active', value: '0', icon: 'fa-calendar-check', color: 'var(--tertiary-mint)' },
    { label: 'Protein (g)', value: '0', icon: 'fa-drumstick-bite', color: 'var(--supporting-peach)' }
  ];

  return (
    <div className="page-content">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
        <h1 style={{ marginBottom: '16px' }}>
          <i className="fas fa-heart" style={{ color: 'var(--primary-pink)' }}></i> Welcome to Fit Tracker
        </h1>
        <p style={{ fontSize: '1.2em', marginBottom: '24px' }}>
          Your cute and efficient fitness companion
        </p>
        {!currentUser && (
          <Link to="/login">
            <button className="btn-primary" style={{ fontSize: '1.1em', padding: '16px 32px' }}>
              <i className="fas fa-rocket"></i> Get Started
            </button>
          </Link>
        )}
      </div>

      {/* Stats Cards (2x2 Grid) */}
      {currentUser && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className="card"
              style={{
                textAlign: 'center',
                borderTop: `4px solid ${stat.color}`
              }}
            >
              <i className={`fas ${stat.icon}`} style={{ fontSize: '2em', color: stat.color, marginBottom: '12px' }}></i>
              <h3 style={{ fontSize: '2em', margin: '8px 0', color: stat.color }}>{stat.value}</h3>
              <p style={{ fontSize: '0.9em' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Features Grid */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Features</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {features.map((feature, index) => (
            <Link
              key={index}
              to={currentUser ? feature.link : '/login'}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="card"
                style={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px 20px'
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: feature.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}
                >
                  <i className={`fas ${feature.icon}`} style={{ fontSize: '2em', color: 'white' }}></i>
                </div>
                <h3 style={{ marginBottom: '12px', color: feature.color }}>{feature.title}</h3>
                <p style={{ fontSize: '0.9em' }}>{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions (if logged in) */}
      {currentUser && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Quick Actions</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px'
          }}>
            {[
              { icon: 'fa-plus', label: 'Add Workout', color: 'var(--primary-pink)', link: '/workouts' },
              { icon: 'fa-pizza-slice', label: 'Log Food', color: 'var(--secondary-blue)', link: '/food-tracker' },
              { icon: 'fa-chart-bar', label: 'View Stats', color: 'var(--tertiary-mint)', link: '/statistics' },
              { icon: 'fa-trophy', label: 'Goals', color: 'var(--supporting-peach)', link: '/statistics' }
            ].map((action, index) => (
              <Link key={index} to={action.link} style={{ textDecoration: 'none' }}>
                <div
                  className="card"
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    padding: '24px 12px'
                  }}
                >
                  <i className={`fas ${action.icon}`} style={{ fontSize: '2em', color: action.color, marginBottom: '8px' }}></i>
                  <p style={{ fontSize: '0.85em', fontWeight: '600', color: action.color }}>{action.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Footer */}
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        borderRadius: 'var(--border-radius-container)',
        background: 'linear-gradient(135deg, var(--primary-pink), var(--secondary-blue))',
        color: 'white',
        marginTop: '40px'
      }}>
        <h2 style={{ color: 'white', marginBottom: '12px' }}>
          <i className="fas fa-star"></i> Start Your Fitness Journey Today
        </h2>
        <p style={{ color: 'white', fontSize: '1.1em' }}>
          Track, measure, and achieve your fitness goals with style
        </p>
      </div>
    </div>
  );
};

export default Home;
