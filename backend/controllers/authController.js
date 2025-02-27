const User = require("../models/User") 
const bcrypt = require("bcryptjs") 
const jwt = require("jsonwebtoken") 
const logger = require("../utils/logger") 

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body 
    
    // Check if all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" })
    }
    
    // Check if user already exists in the database
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }
    
    // Hash the user's password before saving to database
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create a new user record
    const user = await User.create({ name, email, password: hashedPassword })
    
    logger.info("User registered successfully") 
    res.status(201).json({ message: "User registered successfully" }) 
  } catch (error) {
    logger.error("Error registering user:", error)
    res.status(500).json({ message: "Error registering user", error: error.message }) 
  }
}

// Authenticate user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body 
    
   
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" })
    }
    
  
    const user = await User.findOne({ email })
    
    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" })
    }
    
    // Generate a JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    })
    
    logger.info("User logged in successfully") // Log successful login
    res.json({ token }) // Send token as response
  } catch (error) {
    logger.error("Error logging in:", error) // Log error details
    res.status(500).json({ message: "Error logging in", error: error.message }) // Send error response
  }
}

module.exports = { registerUser, loginUser } 
