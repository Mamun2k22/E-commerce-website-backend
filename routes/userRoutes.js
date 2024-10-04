import express from 'express';
import { getAllUsers, deleteUserById } from '../controller/userController.js';


const router = express.Router();

// Route to get all users
router.get('/', getAllUsers);

// Route to delete a user by ID
router.delete('/:id', deleteUserById);

export default router;
