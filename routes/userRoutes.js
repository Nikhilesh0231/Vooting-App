const express = require('express');
const router = express.Router();
const User = require('./../models/user.js');
const { jwtAuthMiddleware, generateToken } = require('./../jwt.js');


//Route to register the user
router.post('/signup', async (req, res) => {
  try {
    const data = req.body;
    // Check if there is already an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (data.role === 'admin' && adminUser) {
      return res.status(400).json({ error: 'Admin user already exists' });
    }

    // Validate Aadhar Card Number must have exactly 12 digit
    if (!/^\d{12}$/.test(data.aadharCardNumber)) {
      return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
    }

    // Check if a user with the same Aadhar Card Number already exists
    const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
    if (existingUser) {
      return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
    }

    const newUser = new User(data);
    const response = await newUser.save();
    console.log('Data Saved');
    const payload = {
      id: response.id
    }
    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is : ", token);
    res.status(200).json({ response: response, token: token });
  }
  catch (error) {
    console.log(error);
    res.status(400).json({ error: 'Intrenal Server Error' });
  }
});


//Route to loginm the user
router.post('/login', async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;

    // Check if aadharCardNumber or password is missing
    if (!aadharCardNumber || !password) {
      return res.status(400).json({ error: 'Aadhar Card Number and password are required' });
    }
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid aadharCardNumber or password' });
    }
    const payload = {
      id: user.id
    }
    const token = generateToken(payload);
    res.json({ token });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Intrenal Server Error' });
  }
});

// Route to Profile
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
  try {

    const userData = req.user;
    const userId = userData.id;
    //Find the user by userId
    const user = await User.findById(userId);
    res.status(200).json({ user });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server error' })
  }
});

// Route to Update User data
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
  try {
    //Extract the ID From the token
    const userId = req.user.id;
    //Extract current and new passwords from the request body
    const { currentPassword, newPassword } = req.body;
    // Check if currentPassword and newPassword are present in the request body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
    }

    //Find the user by userId
    const user = await User.findById(userId);
    //If password does not match , return error 
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Invalid current password' });
    }
    //Update the user's password
    user.password = newPassword;
    await user.save();
    //
    console.log("Password Updated");
    res.status(200).json({ message: 'Password updated successfully' });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server error' })
  }
});

module.exports = router;