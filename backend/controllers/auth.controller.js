import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetSession from "../utils/generateToken.js";

import { v4 as uuidv4 } from "uuid";

export const signup = async (req, res) => {
  try {
    const { fullname, email, password, isOrg } = req.body;
    
    if (!fullname || !email || !password || typeof isOrg !== "boolean") {
      return res.status(400).json({ message: "fullname, email, password, and isOrg are required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "This user already exists!" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a new user
    const newUserData = {
      fullname,
      email,
      password: hashedPassword,
    };

    if (isOrg) {
      newUserData.org = uuidv4();
      newUserData.role = "ADMIN";
    } else {
      newUserData.role = "USER";
      newUserData.org = null;
    }

    const newUser = new User(newUserData);
    await newUser.save();

    // Generate token + set session
    const tok = generateTokenAndSetSession(req, newUser._id, res);

    return res.status(200).json({
      message: "User registered successfully",
      user: {
        token: tok,
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        org: newUser.org,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const tok = generateTokenAndSetSession(req, user._id, res);

    res.status(200).json({
      message: "Login successful",
      user: {
        token: tok,
        id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error destroying session:", err);
      return res.status(500).json({ message: "Error logging out" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
};
