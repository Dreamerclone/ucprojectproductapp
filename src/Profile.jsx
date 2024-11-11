import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Avatar } from '@mui/material';

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
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/profile', {
          headers: {
            'x-auth-token': token
          }
        });
        setProfile({ username: response.data.username, profileImage: response.data.profileImage, password: '' });
      } catch (error) {
        console.error('Error fetching profile:', error);
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
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('username', profile.username);
      formData.append('password', profile.password);
      if (file) {
        formData.append('profileImage', file);
      }

      await axios.put('http://localhost:3000/profile', formData, {
        headers: {
          'x-auth-token': token,
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
      <Box component="form" noValidate autoComplete="off">
        {profile.profileImage && <Avatar src={`http://localhost:3000/${profile.profileImage}`} sx={{ width: 56, height: 56 }} />}
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
        />
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Profile;
