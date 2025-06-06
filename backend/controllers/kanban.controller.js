import Task from '../models/task.model.js';
import Category from '../models/category.mode.js';

export const getTask = async (req, res) => {
  const tasks = await Task
    .find()
    .populate('category', 'name')
    .populate('assignedTo', 'fullname');   // ← populate user’s fullname
  console.log("Tasks fetched successfully:", tasks);
  res.json(tasks);
};


export const getCategories = async (req, res) => {
  const Categories = await Category.find();
  res.json(Categories);
};

export const createTask = async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.status(201).json(newTask);
};

export const updateTask = async (req, res) => {
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  console.log("Task updated successfully:", updatedTask);
  res.json(updatedTask);
};

export const createCategory = async (req, res) => {
  const { name } = req.body;
  const newCategory = new Category({ name });
  await newCategory.save();
  res.status(201).json(newCategory);
};