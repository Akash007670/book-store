import User from "../models/user.js";

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({}).select("-password -__v"); // Negation -->  -password and -__v will not be there in the response
    if (!allUsers) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({ message: "success", data: allUsers });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
};

export { getAllUsers };
