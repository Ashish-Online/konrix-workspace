import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
  try {
    const requestingUserId = req.user._id;

    const allUsers = await User.find({
      _id: { $ne: requestingUserId },
    }).select("-password");

    const usersForDisplay = allUsers.map((user) => ({
      ...user.toObject(),
      type: "user",
    }));

    res.status(200).json(usersForDisplay);
  } catch (error) {
    console.error("Error in getAllUsers: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addUser = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    
    if (!fullname || !email || !password)
      return res.status(404).json({ message: "All fields are required!" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "This user already exists!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      await newUser.save();

      res.status(200).json({
        message: "User Created successfully",
        user: {
          id: newUser._id,
          fullname: newUser.fullname,
          email: newUser.email,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in addUser: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {

    const {id} = req.params;
    const loggedInUserId = req.user._id.toHexString();
    
    if(id === loggedInUserId) return res.status(401).json({ message: "Cannot delete yourself" });

    const user = await User.findById(`${id}`)

    if(user){
      await User.deleteOne({ _id: id })
      res.status(200).json({message: "User deleted successfully!"})
    }else{
      res.status(400).json({message: "User not found!"})
    }
    
  } catch (error) {
    console.error("Error in DeleteUser: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, email, password } = req.body;
    const loggedInUserId = req.user._id.toHexString();

    if (id === loggedInUserId)
      return res.status(401).json({ message: "Cannot update yourself" });

    const user = await User.findById(id);

    if (!user)
      return res.status(404).json({ message: "User not found!" });

    // Optional: hash new password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (fullname) user.fullname = fullname;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({ message: "User updated successfully!" });
  } catch (error) {
    console.error("Error in updateUser:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};