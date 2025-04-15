module.exports= function authorizationMiddleware(roles) {
    return (req, res, next) => {
      console.log('req:',req.user)
      const userRole = req.user.role;
      if (!roles.includes(userRole))
        return res.status(403).json("unauthorized access");
        // If the user's role is in the allowed roles, proceed to the next middleware
      next();
    };
  }