// routes/layout.routes.js
import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getLayouts, addLayout, deleteLayout, getLayoutById, updateLayout } from '../controllers/layout.controller.js';

const router = express.Router();

router.get('/', protectRoute, getLayouts);
router.post('/addlayouts', protectRoute, addLayout);
router.delete('/delete/:id', protectRoute, deleteLayout);
router.get('/:id', protectRoute, getLayoutById);
router.put('/:id', protectRoute, updateLayout);


export default router;
