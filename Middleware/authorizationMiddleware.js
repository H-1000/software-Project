module.exports= function authorizationMiddleware(roles) {
    return (req, res, next) => {
      console.log('req:',req.user)
      
      if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Unauthorized: User not authenticated or missing role' });
      }
      const userRole = req.user.role;
  
      if (!roles.includes(userRole))
        return res.status(403).json("unauthorized access");
       
      next();
    };
  }