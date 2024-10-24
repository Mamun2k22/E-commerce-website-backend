import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import "./db/database.js"
import authRoutes from "./routes/authRoutes.js"; 
import userRoutes from "./routes/userRoutes.js"; 
import categoryRoutes from "./routes/categoryRoutes.js"; 
import productRoutes from "./routes/productRoutes.js"; 
import colorRoutes from "./routes/colorRoutes.js"; 
import cartRoutes from "./routes/cartRoutes.js"; 
import orderRoutes from "./routes/orderRoutes.js"; 

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'https://bholamart.com', 'https://bhola-mart.netlify.app'],
  credentials: true, // Allows cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

app.use(cookieParser());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, // 1 day expiration
    secure: process.env.NODE_ENV === 'production', // Secure only in production
    httpOnly: true, // Prevent access from JavaScript (for security)
    sameSite: "strict" // Prevent cross-site request forgery (CSRF) attacks
  },
   
}));

app.use("/api/auth", authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', orderRoutes);

// API routes
app.get("/", (req, res) => {
  res.send("Vholamart Is Running Now");
});


// Multer setup for image upload
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });




// Server listening
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
