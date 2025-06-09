// backend/models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    org: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
