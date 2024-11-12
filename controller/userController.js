// userController.js
import { User, AddToCart} from '../model/index.model.js'



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

// Update user profile (name, mobile, bio)
export const updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, mobile, bio, profileImage } = req.body;
  

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...(name && { name }),
        ...(mobile && { mobile }),
        ...(bio && { bio }),
        ...(profileImage && { profileImage })
      },
      { new: true, select: "-password" } // Return updated user excluding password
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



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
