import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
  try {
    // The authenticated user is attached by protectRoute → req.user
    const requestingUser = req.user;
    const requestingUserId = requestingUser._id.toString();
    const orgId = requestingUser.org; 

    const allUsers = await User.find({
      _id: { $ne: requestingUserId },
      org: orgId,
    }).select("-password");

    // Format for frontend
    const usersForDisplay = allUsers.map((user) => ({
      id: user._id.toString(),
      fullname: user.fullname,
      email: user.email,
      created_date: new Date(user.createdAt).toLocaleDateString(),
      role: user.role,
    }));

    return res.status(200).json(usersForDisplay);
  } catch (error) {
    console.error("Error in getAllUsers:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addUser = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    const requestingUser = req.user;
    const orgId = requestingUser.org; // must exist if admin
    const requestingUserId = requestingUser._id.toString();

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // An Admin should be the only one calling this route → they already have protectRoute
    // and their req.user.role === "ADMIN"
    if (requestingUser.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Only an organization‐admin can add new users." });
    }

    // Check if the email is already in use within this org
    const existingUser = await User.findOne({ email, org: orgId });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "A user with that email already exists in your organization!" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user, assigning them to the same org UUID
    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      org: orgId,
      role: "USER", // always a regular user when added by Admin
    });
    await newUser.save();

    return res.status(200).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        created_date: new Date(newUser.createdAt).toLocaleDateString(),
      },
    });
  } catch (error) {
    console.error("Error in addUser:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;
    const orgId = requestingUser.org;
    const requestingUserId = requestingUser._id.toString();

    // Cannot delete oneself, and must share the same org
    if (id === requestingUserId) {
      return res
        .status(401)
        .json({ message: "You cannot delete your own account." });
    }

    const user = await User.findOne({ _id: id, org: orgId });
    if (!user) {
      return res.status(404).json({ message: "User not found in your organization." });
    }

    await User.deleteOne({ _id: id });
    return res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteUser:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, email, password } = req.body;
    const requestingUser = req.user;
    const orgId = requestingUser.org;
    const requestingUserId = requestingUser._id.toString();

    if (id === requestingUserId) {
      return res
        .status(401)
        .json({ message: "You cannot update your own account here." });
    }

    // Find the user in the same organization
    const user = await User.findOne({ _id: id, org: orgId });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found in your organization." });
    }

    // Optionally hash the new password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;

    await user.save();
    return res.status(200).json({ message: "User updated successfully!" });
  } catch (error) {
    console.error("Error in updateUser:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
