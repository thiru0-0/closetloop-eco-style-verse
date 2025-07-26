const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is not set!');
  console.error('Please set JWT_SECRET in your .env file or environment variables.');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('📝 JWT_SECRET:', process.env.JWT_SECRET ? '[SET]' : '[NOT SET]');
console.log('📝 MONGODB_URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/closetloop');
console.log('📝 PORT:', process.env.PORT || 5001);

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/closetloop', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/profile'));
app.use('/api/outfits', require('./routes/outfit'));
app.use('/api/rentals', require('./routes/rental'));
app.use('/api/swaps', require('./routes/swap'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/store', require('./routes/store'));
// app.use('/api/orders', require('./routes/order')); // Missing route file
// app.use('/api/notifications', require('./routes/notification')); // Missing route file
// app.use('/api/admin', require('./routes/admin')); // Missing route file
// app.use('/api/analytics', require('./routes/analytics')); // Missing route file

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;