const jwt = require("jsonwebtoken");

const secretKey = "1234";

const authenticationMiddleware = (req, res, next) => {
  try {
    console.log('Authentication middleware started');
    const cookies = req.cookies;
    console.log('Received cookies:', cookies);

    if (!cookies || !cookies.token) {
      console.log('No token found in cookies');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = cookies.token;
    console.log('Found token:', token.substring(0, 20) + '...');

    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        console.error('Token verification failed:', error.message);
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      if (!decoded.user || !decoded.user.role) {
        console.error('Invalid token payload:', decoded);
        return res.status(403).json({ message: 'Invalid token payload' });
      }

      req.user = decoded.user;
      console.log('Successfully authenticated user:', {
        id: req.user.userId,
        role: req.user.role
      });
      next();
    });
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = authenticationMiddleware;