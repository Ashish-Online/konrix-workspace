import express from 'express';
const router = express.Router();

// import {getTask, createTask, createCategory, updateTask, getCategories} from '../controllers/kanban.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
  
router.get('/', protectRoute, (req, res)=>{
  // Logic to get tasks
  console.log('ndisplay');
  
  res.status(200).json({ message: 'Get tasks endpoint' });
});
router.get('/devicepreview', protectRoute, (req, res)=>{
  // Logic to get tasks
  console.log('log devicepreview');
  res.status(200).json({ message: 'Get tasks endpoint' });
});


export default router;