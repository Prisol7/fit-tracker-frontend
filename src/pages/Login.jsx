import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      let userCredential;
  
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
  
      const token = await userCredential.user.getIdToken();
  
      console.log('Sending request to backend...'); // Debug
  
      // Send credentials to backend
      const response = await fetch('https://fitness-server-e2b1d5e67f36.herokuapp.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          token
        }),
      });
  
      console.log('Response status:', response.status); // Debug
      const responseData = await response.json();
      console.log('Response data:', responseData); // Debug
  
      if (response.ok) {
        navigate('/workouts');
      } else {
        // Show the actual error from backend
        setError(responseData.details || responseData.error || 'Failed to authenticate with backend');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="page-content" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 200px)'
    }}>
      <div className="card" style={{
        maxWidth: '450px',
        width: '100%',
        padding: '40px'
      }}>
        {/* Header with Icon */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-pink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <i className="fas fa-dumbbell" style={{ fontSize: '2em', color: 'white' }}></i>
          </div>
          <h1 style={{ marginBottom: '8px' }}>{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
          <p>
            {isRegister
              ? 'Start your fitness journey today'
              : 'Sign in to continue tracking your progress'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderRadius: 'var(--border-radius-button)',
          backgroundColor: 'var(--dark-surface)',
          padding: '4px'
        }}>
          <button
            onClick={() => setIsRegister(false)}
            className={isRegister ? 'btn-outline' : 'btn-primary'}
            style={{
              flex: 1,
              borderRadius: 'var(--border-radius-button)',
              border: 'none'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={isRegister ? 'btn-primary' : 'btn-outline'}
            style={{
              flex: 1,
              borderRadius: 'var(--border-radius-button)',
              border: 'none'
            }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: 'var(--dark-text-primary)'
            }}>
              <i className="fas fa-envelope" style={{ marginRight: '8px', color: 'var(--primary-pink)' }}></i>
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: 'var(--dark-text-primary)'
            }}>
              <i className="fas fa-lock" style={{ marginRight: '8px', color: 'var(--primary-pink)' }}></i>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: 'var(--border-radius-input)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1.1em',
              marginTop: '8px'
            }}
          >
            <i className={`fas ${isRegister ? 'fa-user-plus' : 'fa-sign-in-alt'}`} style={{ marginRight: '8px' }}></i>
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Social Login Options (placeholder) */}
        <div style={{ marginTop: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#404040' }}></div>
            <span style={{ color: 'var(--dark-text-secondary)', fontSize: '0.9em' }}>
              Or continue with
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#404040' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div
          
              className="btn-outline"
              style={{
                flex: 1,
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <i className="fab fa-apple" style={{ color: 'var(--primary-pink)' }}></i>
              Coming Soon
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
