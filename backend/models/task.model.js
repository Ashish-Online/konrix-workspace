import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  comments: Number,
  attachments: Number,
  priority: String,
  status: String,
  dueDate: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
});

const Task = mongoose.model('Task', taskSchema);

export default Task;