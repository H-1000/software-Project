
const jwt = require("jsonwebtoken");

const secretKey = "1234";

const authenticationMiddleware= (req, res, next) => {
  try {
    const cookie = req.cookies;

    console.log('Inside authentication middleware');

    if (!cookie) {
      return res.status(401).json({ message: 'No cookies found' });
    }

    const token = cookie.token;

    if (!token) {
      return res.status(405).json({ message: 'No token provided in cookie' });
    }

    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        console.error('JWT verification failed:', error.message);
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      req.user = decoded.user;
      console.log('User authenticated:', req.user);
      next();
    });

  } catch (err) {
    console.error('Unexpected error in auth middleware:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = authenticationMiddleware;