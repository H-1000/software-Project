module.exports = function authorizationMiddleware(roles) {
  return (req, res, next) => {
    console.log('Authorization check for roles:', roles);
    console.log('User:', req.user);
    console.log('User role:', req.user?.role);
    
    const userRole = req.user?.role;
    
    if (!userRole) {
      console.log('No user role found');
      return res.status(403).json({ message: "No role found for user" });
    }
    
    if (!roles.includes(userRole)) {
      console.log('Unauthorized: User role', userRole, 'not in allowed roles:', roles);
      return res.status(403).json({ message: "Unauthorized access" });
    }
    
    console.log('Authorization successful for role:', userRole);
    next();
  };
};