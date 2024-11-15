const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors()); // Allow all origins (front-end can communicate with back-end)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from the 'uploads' directory

const secret = 'your_jwt_secret';

// MongoDB connection
mongoose.connect('mongodb+srv://roshua1819:pfgXMsK8TToizgSe@cluster0.7bdu8.mongodb.net/productdb?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Define Product Schema
const productSchema = new mongoose.Schema({
  product_code: String,
  name: String,
  description: String,
  price: Number,
  qty: Number,
  date_added: Date,
  image: String // Path to the product image
});

const Product = mongoose.model('Product', productSchema);

// Define User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  profileImage: String, // Path to the profile image
  role: { type: String, default: 'user' } // Role field with default value 'user'
});

const User = mongoose.model('User', userSchema);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Invalid token', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based access control middleware
const checkRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });
  }
  next();
};

// Register route
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ username, password: bcrypt.hashSync(password, 10), role });
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, secret, { expiresIn: 3600 });

    res.json({ token });
  } catch (err) {
    console.error('Error during registration:', err.message);
    res.status(500).send('Server error');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, secret, { expiresIn: 3600 });

    res.json({ token });
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).send('Server error');
  }
});

// Profile route (GET profile)
app.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).send('Server error');
  }
});

// Update profile route (PUT profile)
app.put('/profile', authMiddleware, upload.single('profileImage'), async (req, res) => {
  const { username, password } = req.body;

  const updatedProfile = {};
  if (username) updatedProfile.username = username;
  if (password) updatedProfile.password = bcrypt.hashSync(password, 10);
  if (req.file) updatedProfile.profileImage = req.file.path;

  try {
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updatedProfile }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).send('Server error');
  }
});

// GET all products - accessible to all authenticated users
app.get('/products', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).send('Server error');
  }
});

// POST new product - accessible to admin only
app.post('/products', authMiddleware, checkRole('admin'), upload.single('image'), async (req, res) => {
  const { product_code, name, description, price, qty, date_added } = req.body;

  const newProduct = new Product({
    product_code,
    name,
    description,
    price,
    qty,
    date_added,
    image: req.file ? req.file.path : ''
  });

  try {
    await newProduct.save();
    res.json({ message: 'Product added!' });
  } catch (err) {
    console.error('Error adding product:', err.message);
    res.status(500).send('Server error');
  }
});

// PUT to update a product by ID - accessible to admin only
app.put('/products/:id', authMiddleware, checkRole('admin'), upload.single('image'), async (req, res) => {
  const { product_code, name, description, price, qty, date_added } = req.body;

  const updatedProduct = {
    product_code,
    name,
    description,
    price,
    qty,
    date_added
  };

  if (req.file) {
    updatedProduct.image = req.file.path;
  }

  try {
    const product = await Product.findByIdAndUpdate(req.params.id, updatedProduct, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product updated!', product });
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).send('Server error');
  }
});

// DELETE a product by ID - accessible to admin only
app.delete('/products/:id', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted!' });
  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).send('Server error');
  }
});

// Buy product route
app.post('/buy/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.qty <= 0) {
      return res.status(400).json({ message: 'Product out of stock' });
    }

    product.qty -= 1;
    await product.save();
    res.json({ message: 'Product bought!', product });
  } catch (err) {
    console.error('Error buying product:', err.message);
    res.status(500).send('Server error');
  }
});

// Get all users route - accessible to admin only
app.get('/users', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).send('Server error');
  }
});

// Delete user by ID - accessible to admin only
app.delete('/users/:id', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted!' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
