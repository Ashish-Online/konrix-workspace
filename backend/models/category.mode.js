import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  org: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
});

const Category = mongoose.model('Category', categorySchema);

export default Category;