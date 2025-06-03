import { log } from 'console';
import jwt from 'jsonwebtoken';

// Either update function param name:
const generateTokenAndSetSession = (req, userId, res) => {
  console.log("userId in generateToken: ", userId);
  
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  // req.session.token = token;
  return token;
};


export default generateTokenAndSetSession;