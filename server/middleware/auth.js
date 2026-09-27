const jwt = require('jsonwebtoken');

// Enhanced JWT Secret with validation
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me-in-production';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('  WARNING: Using default JWT secret in production! Set JWT_SECRET in .env file');
}

function jwtMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    
    // Extract Bearer token
    const tokenMatch = auth.match(/^Bearer\s+(.+)$/);
    if (!tokenMatch) {
      return res.status(401).json({ 
        error: 'Access denied. No valid token provided.',
        message: 'Authorization header must be in format: Bearer <token>'
      });
    }

    const token = tokenMatch[1];
    
    // Verify and decode JWT
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Ensure payload has required fields
    if (!payload.userId || !payload.username) {
      return res.status(401).json({ 
        error: 'Invalid token payload.',
        message: 'Token is missing required user information'
      });
    }

    // Add user info to request object
    req.user = { 
      userId: payload.userId, 
      username: payload.username,
      email: payload.email 
    };
    
    next();
    
  } catch (err) {
    let errorMessage = 'Invalid token.';
    
    if (err.name === 'TokenExpiredError') {
      errorMessage = 'Token has expired. Please login again.';
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Malformed token. Please login again.';
    } else if (err.name === 'NotBeforeError') {
      errorMessage = 'Token not active yet.';
    }
    
    return res.status(401).json({ 
      error: errorMessage,
      tokenError: err.name 
    });
  }
}

module.exports = jwtMiddleware;
