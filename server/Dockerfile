# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install only production dependencies to create a smaller and more secure image
RUN npm install --only=production

# Copy the application's code to the working directory.
# By being explicit, we avoid issues with .dockerignore and create a more reliable build.
COPY server.js .
COPY database.js .
COPY config ./config
COPY migrations ./migrations
COPY models ./models
COPY seeders ./seeders
COPY utils ./utils

# This is the crucial step: explicitly copy the downloads directory.
# This directory is created on the host by your deployment script before the build.
COPY downloads ./downloads

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Define environment variables
ENV NODE_ENV=production

# Run server.js when the container launches
CMD [ "node", "server.js" ]