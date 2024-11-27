import express from 'express';
import { getAllUsers, deleteUserById, updateUserProfile, getUserProfile } from '../controller/userController.js';
import { verifyToken } from '../config/verifytoken.js';

const router = express.Router();
// Route to get the user profile
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);
router.get('/',  getAllUsers);
router.delete('/:id', deleteUserById);

export default router;
