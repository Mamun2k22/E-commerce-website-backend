// colorRoutes.js

import express from 'express';
import { addColor, getColors } from '../controller/colorController.js'; 
import { protect } from '../middleware/protect.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

// Route to add a new color
router.post('/',  addColor); // Assuming the base route is '/colors'

// Route to get all colors
router.get('/',  getColors); // Assuming the base route is '/colors'

// Export the router
export default router;
