# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the rest of the application's code to the working directory
COPY . .

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Define environment variables
# These should be passed in when running the container
ENV NODE_ENV=production
# ENV PORT=3001 # This is good practice but EXPOSE already handles the port.
# Other ENV variables like DATABASE_URL, JWT_SECRET, etc., will be passed via the `docker run` command or ECS task definition.

# Run server.js when the container launches
CMD [ "node", "server.js" ] 