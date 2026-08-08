FROM node:22-alpine

# Set the working directory inside the container.
WORKDIR /app

# Copy dependency files first to take advantage of Docker build cache.
COPY package*.json ./

# Install dependencies from package-lock.json.
RUN npm ci

# Copy the frontend source code into the image.
COPY . .

# Document the port used by the Vite development server.
EXPOSE 5173

# Start the frontend development server.
CMD ["npm", "run", "dev"]
