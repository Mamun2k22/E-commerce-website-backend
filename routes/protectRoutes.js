import { protect, authenticate } from '../controller/authController.js';

// Protect a route
app.get('/protected-route', protect, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Authenticate a route
app.get('/some-other-route', authenticate, (req, res) => {
  res.json({ message: 'You are authenticated', user: req.user });
});
