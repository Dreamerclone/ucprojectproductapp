import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { styled } from '@mui/system';
import AddProduct from './AddProduct';
import ProductList from './ProductList';
import Profile from './Profile';
import Login from './Login';
import Register from './Register';
import UserList from './UserList';
import theme from './theme';

const NavLink = styled(Link)`
  margin-right: 20px;
  color: white;
  text-decoration: none;
`;

const MainContainer = styled(Container)`
  width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const AppContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Content = styled(Box)`
  flex: 1;
  padding: 20px;
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContainer>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Inventory System
              </Typography>
              <Button color="inherit" component={NavLink} to="/">
                Add Product
              </Button>
              <Button color="inherit" component={NavLink} to="/products">
                Product List
              </Button>
              {isAuthenticated ? (
                <>
                  <Button color="inherit" component={NavLink} to="/profile">
                    Profile
                  </Button>
                  <Button color="inherit" component={NavLink} to="/users">
                    User List
                  </Button>
                  <Button color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button color="inherit" component={NavLink} to="/login">
                    Login
                  </Button>
                  <Button color="inherit" component={NavLink} to="/register">
                    Register
                  </Button>
                </>
              )}
            </Toolbar>
          </AppBar>
          <Content>
            <MainContainer>
              <Routes>
                <Route path="/" element={<AddProduct />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
                <Route path="/users" element={isAuthenticated ? <UserList /> : <Navigate to="/login" />} />
              </Routes>
            </MainContainer>
          </Content>
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App;
