const userService = require('../services/users');
module.exports = (allowed_roles = {}) => {
  return async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
      res.status(401).json({
        message: 'Unauthorized access'
      });
      return;
    }
    try {

      const authUser = await userService.verify({
        token: token.replace('bearer ', ''),
        allowed_roles
      });
      req.authUser = authUser;
      next();
    } catch (e) {
      res.status(500).json({
        message: e.message
      })
    }
    
  }
}