import React, { useState } from 'react';
import axios from 'axios';
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:3000/products', {
        product_code: product.productCode,
        name: product.name,
        description: product.description,
        price: product.price,
        qty: product.quantity,
        date_added: product.dateAdded,
      });
      alert('Product saved successfully!');
      setProduct({
        productCode: '',
        name: '',
        description: '',
        price: '',
        quantity: '',
        dateAdded: ''
      });
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
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
