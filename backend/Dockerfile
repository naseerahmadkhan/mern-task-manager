# Use official Node.js image as base
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose port 5000
EXPOSE 5000

# Set environment variable for port
ENV PORT=5000

# Command to start the server
CMD ["node", "server.js"]

