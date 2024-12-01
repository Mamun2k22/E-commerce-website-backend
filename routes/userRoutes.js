import express from 'express';
import { getAllUsers, deleteUserById,} from '../controller/userController.js';

const router = express.Router();
router.get('/',  getAllUsers);
router.delete('/:id', deleteUserById);
// router.put('/profile/:userId', updateUserProfile);
export default router;