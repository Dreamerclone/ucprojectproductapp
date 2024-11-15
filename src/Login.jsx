import React, { useState } from 'react';
import axios from './axiosConfig'; // Use centralized Axios config
import { TextField, Button, Container, Typography, Box, Paper } from '@mui/material';
import { styled } from '@mui/system';

const FormContainer = styled(Paper)`
  padding: 20px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        onLogin(); // Update authentication state
        window.location.href = "/products"; // Redirect after successful login
      } else {
        alert('Login failed: No token received');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login failed: Invalid credentials');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <FormContainer>
        <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
          <TextField
            label="Username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary">
              Login
            </Button>
          </Box>
        </Box>
      </FormContainer>
    </Container>
  );
};

export default Login;
