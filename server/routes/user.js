const express = require('express');
const router = express.Router();

// Mock user database (same as in auth.js - replace with actual database)
const users = [];

// Get user profile
router.get('/profile/:userId', (req, res) => {
  const { userId } = req.params;
  const user = users.find(u => u.id === parseInt(userId));
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    balance: user.balance,
    createdAt: user.createdAt
  });
});

// Update user balance
router.post('/balance/:userId', (req, res) => {
  const { userId } = req.params;
  const { amount, type } = req.body; // type: 'add' or 'subtract'
  
  const user = users.find(u => u.id === parseInt(userId));
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  if (type === 'add') {
    user.balance += amount;
  } else if (type === 'subtract') {
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    user.balance -= amount;
  }
  
  res.json({ balance: user.balance });
});

module.exports = router;
