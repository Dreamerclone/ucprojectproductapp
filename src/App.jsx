import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Container, CssBaseline } from "@mui/material";
import styled from '@emotion/styled';
import AddProduct from "./AddProduct";
import ProductList from "./ProductList";
import Profile from "./Profile";
import Login from "./Login";
import Register from "./Register";

const NavLink = styled(Link)`
  margin-right: 20px;
  color: white;
  text-decoration: none;
`;

const AppContainer = styled(Container)`
  margin-top: 20px;
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CREATED BY JOSHUA JADE EROJO
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
      <AppContainer>
        <Routes>
          <Route path="/" element={<AddProduct />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App;
