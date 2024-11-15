import React, { useState } from 'react';
import axios from './axiosConfig';
import { TextField, Button, Typography, Box, Paper } from '@mui/material';
import { styled } from '@mui/system';

const FormContainer = styled(Paper)`
  padding: 20px;
  margin-top: 20px;
`;

const AddProduct = () => {
  const [product, setProduct] = useState({
    productCode: '',
    name: '',
    description: '',
    price: '',
    quantity: '',
    dateAdded: ''
  });
  const [file, setFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Unauthorized. Please log in.');
        return;
      }

      const formData = new FormData();
      formData.append('product_code', product.productCode);
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('price', product.price);
      formData.append('qty', product.quantity);
      formData.append('date_added', product.dateAdded);
      if (file) {
        formData.append('image', file);
      }

      await axios.post('http://localhost:3000/products', formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Product added successfully!');
      setProduct({
        productCode: '',
        name: '',
        description: '',
        price: '',
        quantity: '',
        dateAdded: ''
      });
      setFile(null);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Unauthorized. Please log in again.');
      } else {
        console.error('Error adding product:', error);
        alert('Failed to add product');
      }
    }
  };

  const handleClear = () => {
    setProduct({
      productCode: '',
      name: '',
      description: '',
      price: '',
      quantity: '',
      dateAdded: ''
    });
    setFile(null);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Add Product
      </Typography>
      <FormContainer>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="Product Code"
            name="productCode"
            value={product.productCode}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Name"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            name="description"
            value={product.description}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Price"
            name="price"
            type="number"
            value={product.price}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            value={product.quantity}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Date Added"
            name="dateAdded"
            type="date"
            value={product.dateAdded}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
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
            <Button variant="outlined" color="secondary" onClick={handleClear} style={{ marginLeft: '10px' }}>
              Clear
            </Button>
          </Box>
        </Box>
      </FormContainer>
    </Box>
  );
};

export default AddProduct;
