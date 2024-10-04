const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const prisma = new PrismaClient();
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

// Register user
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.instructor.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.status(201).send({ token });
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.instructor.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).send('Invalid username or password');
    }

    // Compare password using bcrypt
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).send('Invalid username or password');
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.send({ token });
  } catch (error) {
    next(error);
  }
});

// GitHub OAuth - Step 1: Redirect to GitHub for authentication
router.get('/github', (req, res) => {
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user`;
  res.redirect(redirectUri);
});

// GitHub OAuth - Step 2: Handle callback and get access token
// GitHub OAuth callback
router.get('/github/callback', async (req, res, next) => {
  const { code } = req.query;
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }, {
      headers: {
        Accept: 'application/json',
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // Fetch user data from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    const { login: username } = userResponse.data;

    // Check if user exists in the database
    let user = await prisma.instructor.findUnique({ where: { username } });

    // If user does not exist, create a new one
    if (!user) {
      user = await prisma.instructor.create({
        data: { username, password: '' }, // No password for GitHub OAuth users
      });
    }

    // Generate a JWT for the user
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    
    // Send token to client
    res.redirect(`/auth/success?token=${token}`);
  } catch (error) {
    next(error);
  }
});


module.exports = router;
