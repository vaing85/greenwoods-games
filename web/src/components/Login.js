import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
`;

const LoginForm = styled.form`
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: #fff;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #fff;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    outline: none;
    border-color: #ff6b6b;
  }
`;

const PasswordContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PasswordInput = styled(Input)`
  padding-right: 3rem;
`;

const EyeButton = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
  
  &:hover {
    color: #ff6b6b;
  }
  
  &:focus {
    outline: none;
  }
`;

const EyeIcon = styled.span`
  font-size: 1.2rem;
  user-select: none;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  border: none;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 1rem;
  width: 100%;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  text-align: center;
  margin-top: 1rem;
`;

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.username, formData.email, formData.password);
      }

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const result = await response.json();
      
      if (result.success) {
        setError('Password reset instructions sent to your email!');
        setShowForgotPassword(false);
        setResetEmail('');
      } else {
        setError(result.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <LoginContainer>
      {showForgotPassword ? (
        <LoginForm onSubmit={handleForgotPassword}>
          <Title>Reset Password</Title>
          
          <FormGroup>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </FormGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </Button>
          
          <ToggleButton
            type="button"
            onClick={() => setShowForgotPassword(false)}
          >
            Back to Login
          </ToggleButton>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </LoginForm>
      ) : (
        <LoginForm onSubmit={handleSubmit}>
          <Title>{isLogin ? 'Login' : 'Register'}</Title>
        
        {!isLogin && (
          <FormGroup>
            <Label>Username</Label>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </FormGroup>
        )}
        
        <FormGroup>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Password</Label>
          <PasswordContainer>
            <PasswordInput
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
            <EyeButton
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon>
                {showPassword ? "🙈" : "👁"}
              </EyeIcon>
            </EyeButton>
          </PasswordContainer>
        </FormGroup>
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
        </Button>
        
        {isLogin && !showForgotPassword && (
          <ToggleButton
            type="button"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot Password?
          </ToggleButton>
        )}
        
        <ToggleButton
          type="button"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </ToggleButton>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        </LoginForm>
      )}
    </LoginContainer>
  );
};

export default Login;
