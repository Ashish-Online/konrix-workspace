import express from 'express';
import { Router } from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getAllUsers, addUser, deleteUser, updateUser } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', protectRoute, getAllUsers);
router.post('/adduser/', protectRoute, addUser);
router.delete('/deleteuser/:id', protectRoute, deleteUser);
router.put('/updateuser/:id', protectRoute, updateUser);

export default router;