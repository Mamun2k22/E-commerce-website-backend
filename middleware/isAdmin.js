// middlewares/isAdmin.js
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") { // Changed "isAdmin" to "admin"
        return next();
    } else {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
};
