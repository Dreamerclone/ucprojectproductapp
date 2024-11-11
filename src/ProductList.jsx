import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, TextField } from '@mui/material';
import { styled } from '@mui/system';

const FormContainer = styled(Paper)`
  padding: 20px;
  margin-top: 20px;
`;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editProduct, setEditProduct] = useState({
    productCode: '',
    name: '',
    description: '',
    price: '',
    quantity: '',
    dateAdded: ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/products/${id}`);
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (product) => {
    setIsEditing(product._id);
    setEditProduct({
      productCode: product.product_code,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.qty,
      dateAdded: product.date_added
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3000/products/${isEditing}`, {
        product_code: editProduct.productCode,
        name: editProduct.name,
        description: editProduct.description,
        price: editProduct.price,
        qty: editProduct.quantity,
        date_added: editProduct.dateAdded,
      });
      setIsEditing(null);
      const updatedProducts = await axios.get('http://localhost:3000/products');
      setProducts(updatedProducts.data);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Product List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Date Added</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan="7">No products found</TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.product_code}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.qty}</TableCell>
                  <TableCell>{new Date(product.date_added).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => handleEdit(product)}>
                      Edit
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => handleDelete(product._id)} style={{ marginLeft: '10px' }}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {isEditing && (
        <FormContainer>
          <Typography variant="h5" gutterBottom>
            Edit Product
          </Typography>
          <Box component="form" noValidate autoComplete="off">
            <TextField
              label="Product Code"
              name="productCode"
              value={editProduct.productCode}
              onChange={(e) => setEditProduct({ ...editProduct, productCode: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Name"
              name="name"
              value={editProduct.name}
              onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Description"
              name="description"
              value={editProduct.description}
              onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Price"
              name="price"
              type="number"
              value={editProduct.price}
              onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Quantity"
              name="quantity"
              type="number"
              value={editProduct.quantity}
              onChange={(e) => setEditProduct({ ...editProduct, quantity: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Date Added"
              name="dateAdded"
              type="date"
              value={editProduct.dateAdded}
              onChange={(e) => setEditProduct({ ...editProduct, dateAdded: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Box mt={2}>
              <Button variant="contained" color="primary" onClick={handleUpdate}>
                Update Product
              </Button>
            </Box>
          </Box>
        </FormContainer>
      )}
    </Box>
  );
};

export default ProductList;
