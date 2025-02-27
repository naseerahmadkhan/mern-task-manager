const Task = require("../models/Task") // Import Task model
const logger = require("../utils/logger") // Import logger for logging errors

// Fetch all tasks for the authenticated user
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id })
    res.json(tasks)
  } catch (error) {
    logger.error("Error fetching tasks:", error)
    res.status(500).json({ message: "Error fetching tasks", error: error.message })
  }
}

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body
    
    // Check if title is provided
    if (!title) return res.status(400).json({ message: "Title is required" })
    
    const task = await Task.create({
      title,
      description,
      user: req.user._id,
    })
    
    logger.info("Task created successfully") // Log successful task creation
    res.status(201).json(task)
  } catch (error) {
    logger.error("Error creating task:", error)
    res.status(500).json({ message: "Error creating task", error: error.message })
  }
}

// Update an existing task
const updateTask = async (req, res) => {
  try {
    const { title, description, completed } = req.body
    const taskId = req.params.id
    
    // Find the task and ensure it belongs to the authenticated user
    const task = await Task.findOne({ _id: taskId, user: req.user._id })
    if (!task) {
      return res.status(404).json({ message: "Task not found or not authorized" })
    }
    
    // Update only provided fields
    if (title !== undefined) task.title = title
    if (description !== undefined) task.description = description
    if (completed !== undefined) task.completed = completed
    
    const updatedTask = await task.save()
    logger.info("Task updated successfully") // Log successful update
    res.json(updatedTask)
  } catch (error) {
    logger.error("Error updating task:", error)
    res.status(500).json({ message: "Error updating task", error: error.message })
  }
}

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id
    
    // Find and delete the task only if it belongs to the authenticated user
    const task = await Task.findOneAndDelete({ _id: taskId, user: req.user._id })
    if (!task) {
      return res.status(404).json({ message: "Task not found or not authorized" })
    }
    
    logger.info("Task deleted successfully") // Log successful deletion
    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    logger.error("Error deleting task:", error)
    res.status(500).json({ message: "Error deleting task", error: error.message })
  }
}

// Fetch paginated tasks
const getTasksPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit
    
    const tasks = await Task.find({ user: req.user._id }).skip(skip).limit(parseInt(limit))
    const total = await Task.countDocuments({ user: req.user._id })
    
    res.json({
      tasks,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalTasks: total,
    })
  } catch (error) {
    logger.error("Error fetching paginated tasks:", error)
    res.status(500).json({ message: "Error fetching paginated tasks", error: error.message })
  }
}

// Search tasks by title or description
const searchTasks = async (req, res) => {
  try {
    const { q } = req.query
    
    // Ensure search query is provided
    if (!q) return res.status(400).json({ message: "Search query is required" })
    
    const tasks = await Task.find({
      user: req.user._id,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    })
    
    res.json(tasks)
  } catch (error) {
    logger.error("Error searching tasks:", error)
    res.status(500).json({ message: "Error searching tasks", error: error.message })
  }
}

// Filter tasks based on completion status
const filterTasks = async (req, res) => {
  try {
    const { completed } = req.query
    const filter = { user: req.user._id }
    
    // Convert completed query param to boolean
    if (completed !== undefined) filter.completed = completed === "true"
    
    const tasks = await Task.find(filter)
    res.json(tasks)
  } catch (error) {
    logger.error("Error filtering tasks:", error)
    res.status(500).json({ message: "Error filtering tasks", error: error.message })
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTasksPaginated,
  searchTasks,
  filterTasks,
}
