# Task Manager API

This is a Node.js-based Task Manager API that can be run directly using Node.js or inside a Docker container.

## Prerequisites

- Node.js (>=14.x)
- npm or yarn
- MongoDB (local or cloud instance)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/naseerahmadkhan/mern-task-manager.git
   cd task-manager
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

## Configuration

Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/naseer_task_manager
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```

## Running the Server

Start the Node.js server directly:
   ```sh
   npm start
   ```

or using Nodemon for development:
   ```sh
   npm run dev
   ```

## Running in Docker

1. Build the Docker image:
   ```sh
   docker build -t task-manager .
   ```

2. Run the container:
   ```sh
   docker run -p 5000:5000 --env-file .env task-manager
   ```

## API Endpoints

### 1. Register a User
**Method:** POST  
**URL:** `http://localhost:5000/api/auth/register`  
**Body (JSON, raw):**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Log in a User
**Method:** POST  
**URL:** `http://localhost:5000/api/auth/login`  
**Body (JSON, raw):**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### 3. Create a Task (Requires Authorization)
**Method:** POST  
**URL:** `http://localhost:5000/api/tasks`  
**Headers:**
```
Authorization: Bearer <your_generated_jwt_token>
```
**Body (JSON, raw):**
```json
{
  "title": "First Task",
  "description": "This is a test task."
}
```

### 4. Get All Tasks (Requires Authorization)
**Method:** GET  
**URL:** `http://localhost:5000/api/tasks`  
**Headers:**
```
Authorization: Bearer <your_generated_jwt_token>
```

### 5. Update a Task (Requires Authorization)
**Method:** PUT  
**URL:** `http://localhost:5000/api/tasks/{task_id}`  
Replace `{task_id}` with the actual task `_id` from the previous response.

**Headers:**
```
Authorization: Bearer <your_generated_jwt_token>
```
**Body (JSON, raw):**
```json
{
  "completed": true
}
```

### 6. Delete a Task (Requires Authorization)
**Method:** DELETE  
**URL:** `http://localhost:5000/api/tasks/{task_id}`  
Replace `{task_id}` with the actual task `_id`.

**Headers:**
```
Authorization: Bearer <your_generated_jwt_token>
```

## License

This project is licensed under the MIT License.

