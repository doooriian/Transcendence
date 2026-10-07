FROM node:24-alpine

# Set the working directory inside the container.
WORKDIR /app

# Copy dependency files first to take advantage of Docker build cache
COPY package*.json ./

# Install dependencies from package-lock.json.
RUN npm ci

# Allow Prisma to update its files when the backend runs as the node user.
RUN chown -R node:node /app/node_modules

# Copy the backend source code into the image.
COPY . .

# Document the port used by the Express server.
EXPOSE 3000

# Start the backend in standard mode.
CMD ["npm", "start"]
