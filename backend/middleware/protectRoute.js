import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  try {
   const token = req.session.token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized, invalid token' });
    }
    
    //find user from User model without password
    //decode.id is the id of the user from the token where we passed the id: user._id
    const user = await User.findById(decoded.id).select('-password');

    if(!user){
      return res.status(401).json({ message: 'Unauthorized, user not found' });
    }
    // Attach the user to the request object
    // This allows us to access the user in the next middleware or route handler, which is the sendMessages controller
    req.user = user;

    next();
  } catch (error) {
    console.error('Error in protectRoute middleware:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}