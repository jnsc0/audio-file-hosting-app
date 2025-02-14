# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port your app will run on (replace 8080 with your app's port)
EXPOSE 8080

# Define the command to run your app
CMD ["node", "server.js"]
