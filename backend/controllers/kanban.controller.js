import Task from '../models/task.model.js';
import Category from '../models/category.mode.js';

export const getTask = async (req, res) => {
  const cats = await Category.find({ org: req.user._id }).select('_id')
  const catIds = cats.map(c => c._id)

  const tasks = await Task
    .find({ category: { $in: catIds } })
    .populate('category', 'name')
    .populate('assignedTo', 'fullname')

  res.json(tasks)
}


export const getCategories = async (req, res) => {
  // only categories for this org
  const categories = await Category
    .find({ org: req.user._id })
    .select('name')
  res.json(categories)
}

export const createTask = async (req, res) => {
  // req.body.category is the category _id; it already belongs to the org
  const newTask = new Task(req.body)
  await newTask.save()
  res.status(201).json(newTask)
}

export const updateTask = async (req, res) => {
  // only let them update if it belongs to their org
  const task = await Task.findById(req.params.id)
  if (!task) return res.status(404).send('Not found')
  // check the category on it is in this org
  const cat = await Category.findOne({ _id: task.category, org: req.user._id })
  if (!cat) return res.status(403).send('Forbidden')
  const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(updated)
}

export const createCategory = async (req, res) => {
  const newCategory = new Category({
    name: req.body.name,
    org:    req.user._id
  })
  await newCategory.save()
  res.status(201).json(newCategory)
}