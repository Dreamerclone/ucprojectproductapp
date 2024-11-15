import React, { useEffect, useState } from 'react';
import axios from './axiosConfig'; // Use centralized Axios config
import { TextField, Button, Container, Typography, Box, Avatar, Paper } from '@mui/material';
import { styled } from '@mui/system';

const FormContainer = styled(Paper)`
  padding: 20px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Profile = () => {
  const [profile, setProfile] = useState({
    username: '',
    password: '',
    profileImage: ''
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/profile'); // Token should be automatically included
        setProfile({ username: response.data.username, profileImage: response.data.profileImage, password: '' });
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response && error.response.status === 401) {
          alert('Unauthorized access. Please log in again.');
          window.location.href = '/login';
        } else if (error.response && error.response.status === 404) {
          alert('Profile not found. Please log in again.');
          window.location.href = '/login';
        } else {
          alert('Failed to load profile data.');
        }
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('username', profile.username);
      formData.append('password', profile.password);
      if (file) {
        formData.append('profileImage', file);
      }

      await axios.put('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <FormContainer>
        {profile.profileImage && <Avatar src={`http://localhost:3000/${profile.profileImage}`} sx={{ width: 100, height: 100 }} />}
        <TextField
          label="Username"
          name="username"
          value={profile.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={profile.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <input
          accept="image/*"
          type="file"
          onChange={handleFileChange}
          style={{ margin: '20px 0' }}
        />
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </FormContainer>
    </Container>
  );
};

export default Profile;
