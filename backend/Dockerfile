# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Expose the port your app will run on (replace 8080 with your app's port)
EXPOSE 8080

# Define the command to run your app
CMD ["node", "server.js"]
