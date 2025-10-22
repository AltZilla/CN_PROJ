const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/verify', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token missing' });
  }

  try {
    // Verify token with Google OAuth2 tokeninfo endpoint
    const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
    
    // If valid, send user info (email, sub, name, etc.) back to client
    res.json({ user: response.data });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
