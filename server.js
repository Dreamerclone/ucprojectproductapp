const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());  // Allow all origins (front-end can communicate with back-end)
app.use('/uploads', express.static('uploads')); // Serve static files from the 'uploads' directory

const secret = 'your_jwt_secret';

// MongoDB connection
mongoose.connect('mongodb+srv://roshua1819:pfgXMsK8TToizgSe@cluster0.7bdu8.mongodb.net/productdb?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Define Product Schema
const productSchema = new mongoose.Schema({
  product_code: String,
  name: String,
  description: String,
  price: Number,
  qty: Number,
  date_added: Date
});

const Product = mongoose.model('Product', productSchema);

// Define User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  profileImage: String // Path to the profile image
});

const User = mongoose.model('User', userSchema);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Routes

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ username, password: bcrypt.hashSync(password, 10) });
    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, secret, { expiresIn: 3600 });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
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

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, secret, { expiresIn: 3600 });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get profile route
app.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update profile route
app.put('/profile', authMiddleware, upload.single('profileImage'), async (req, res) => {
  const { username, password } = req.body;

  const updatedProfile = {};
  if (username) updatedProfile.username = username;
  if (password) updatedProfile.password = bcrypt.hashSync(password, 10);
  if (req.file) updatedProfile.profileImage = req.file.path;

  try {
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updatedProfile }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET all products
app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// POST new product
app.post('/products', async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json({ message: 'Product added!' });
});

// PUT to update a product by ID
app.put('/products/:id', async (req, res) => {
  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: 'Product updated!', updatedProduct });
});

// DELETE a product by ID
app.delete('/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted!' });
});


// Get all users route
app.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
