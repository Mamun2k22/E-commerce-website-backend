// userController.js
import { User, AddToCart} from '../model/index.model.js'
import jwt from 'jsonwebtoken';

// Controller function to get user profile
// export const getUserProfile = async (req, res) => {
//   try {
//     // Extract user ID from the token, which is added by verifyToken middleware
//     const userId = req.user.id;

//     // Find the user by ID, excluding the password field
//     const user = await User.findById(userId).select('-password');

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Return the user profile data
//     res.status(200).json({ user });
//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

// Controller function to get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// export const updateUserProfile = async (req, res) => {
//   const userId = req.params.userId;
//   const { name, mobile, bio, profileImage } = req.body;

//   if (!name && !mobile && !bio && !profileImage) {
//     return res.status(400).json({ message: "No fields to update." });
//   }

//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       req.user.id,
//       {
//         ...(name && { name }),
//         ...(mobile && { mobile }),
//         ...(bio && { bio }),
//         ...(profileImage && { profileImage }),
//       },
//       { new: true, projection: { password: 0 } } // Exclude password from the response
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Generate a new token with updated user details
//     const token = jwt.sign(
//       { id: updatedUser._id, email: updatedUser.email, role: updatedUser.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1d' }
//     );

//     res.status(200).json({
//       message: 'Profile updated successfully',
//       user: updatedUser,
//       token, // Return the updated token
//     });
//   } catch (error) {
//     console.error('Error updating profile:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };



// Delete user by ID

export const deleteUserById = async (req, res) => {
    const { id } = req.params;
    console.log(req.params)
    try {
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
