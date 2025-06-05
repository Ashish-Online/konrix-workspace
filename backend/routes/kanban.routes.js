import express from 'express';
const router = express.Router();

import {getTask, createTask, createCategory, updateTask, getCategories} from '../controllers/kanban.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
  
router.get('/gettasks', protectRoute, getTask);
router.post('/addtask', protectRoute, createTask);
router.get('/getcategories', protectRoute, getCategories);
router.put('/updatetask/:id', protectRoute, updateTask); 
router.post('/addcategory', protectRoute, createCategory);


export default router;