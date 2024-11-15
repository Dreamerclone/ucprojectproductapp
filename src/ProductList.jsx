import React, { useEffect, useState } from 'react';
import axios from './axiosConfig';
import {
  TextField,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { styled } from '@mui/system';

const FormContainer = styled(Paper)`
  padding: 20px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProductList = ({ role }) => {
  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editProduct, setEditProduct] = useState({
    productCode: '',
    name: '',
    description: '',
    price: '',
    quantity: '',
    dateAdded: '',
    file: null,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setIsEditing(product._id);
    setEditProduct({
      productCode: product.product_code,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.qty,
      dateAdded: product.date_added,
      file: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditProduct({ ...editProduct, [name]: value });
  };

  const handleFileChange = (e) => {
    setEditProduct({ ...editProduct, file: e.target.files[0] });
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('product_code', editProduct.productCode);
      formData.append('name', editProduct.name);
      formData.append('description', editProduct.description);
      formData.append('price', editProduct.price);
      formData.append('qty', editProduct.quantity);
      formData.append('date_added', editProduct.dateAdded);
      if (editProduct.file) {
        formData.append('image', editProduct.file);
      }

      await axios.put(`/products/${isEditing}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIsEditing(false);
      const updatedProducts = await axios.get('/products');
      setProducts(updatedProducts.data);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/products/${id}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleBuy = async (id) => {
    try {
      await axios.post(`/buy/${id}`, {}, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      alert('Successfully bought the product!');
      const updatedProducts = await axios.get('/products');
      setProducts(updatedProducts.data);
    } catch (error) {
      console.error('Error buying product:', error);
      alert('Failed to buy product');
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
              <TableCell>Image</TableCell>
              <TableCell>Product Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
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
                  <TableCell>
                    {product.image && (
                      <img src={`http://localhost:3000/${product.image}`} alt={product.name} width="100" />
                    )}
                  </TableCell>
                  <TableCell>{product.product_code}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>₱{product.price}</TableCell>
                  <TableCell>{product.qty}</TableCell>
                  <TableCell>
                    {role === 'admin' ? (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleDelete(product._id)}
                          style={{ marginLeft: '10px' }}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleBuy(product._id)}
                      >
                        Buy
                      </Button>
                    )}
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
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Name"
              name="name"
              value={editProduct.name}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Description"
              name="description"
              value={editProduct.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Price"
              name="price"
              type="number"
              value={editProduct.price}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Quantity"
              name="quantity"
              type="number"
              value={editProduct.quantity}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Date Added"
              name="dateAdded"
              type="date"
              value={editProduct.dateAdded}
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
