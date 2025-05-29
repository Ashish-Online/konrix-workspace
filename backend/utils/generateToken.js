import { log } from 'console';
import jwt from 'jsonwebtoken';

const generateTokenAndSetSession = (req, user, res) => {
  // Generate a JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  
  req.session.token = token;
return token;
// console.log("Token generated and req.session.token:", req.session.token);

}

export default generateTokenAndSetSession;