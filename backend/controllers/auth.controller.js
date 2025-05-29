import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetSession from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    console.log("Received signup request with data:", req.body);

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required from signup" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "This user already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    //save on the database
    if (newUser){
      //Generate a JWT token
      await newUser.save();
      const tok = generateTokenAndSetSession(req, newUser._id, res);
      // console.log("Token generated and token:", tok);
      res.status(200).json({
      message: "User registered successfully",
      user: {
        token: tok,
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
      },
    });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.error("Error during signup:", error.message);
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
    console.log("Error during login:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
