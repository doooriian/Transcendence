# Stage 1: compile Stockfish on Alpine.
FROM node:24-alpine AS stockfish-build

RUN apk add --no-cache build-base git curl ca-certificates

WORKDIR /stockfish

# Use the same Stockfish version as the previous Debian image.
RUN git clone --depth 1 --branch sf_15.1 \
    https://github.com/official-stockfish/Stockfish.git .

WORKDIR /stockfish/src

# Build for x86-64 and remove debugging symbols.
RUN make -j2 build ARCH=x86-64 \
    && strip stockfish

# Stage 2: build the final backend image.
FROM node:24-alpine

# Install the runtime libraries required by Stockfish.
RUN apk add --no-cache libstdc++ libgcc

# Copy the compiled engine and its license.
COPY --from=stockfish-build \
    /stockfish/src/stockfish /usr/local/bin/stockfish

COPY --from=stockfish-build \
    /stockfish/Copying.txt /usr/local/share/licenses/stockfish/Copying.txt

# Tell the backend where to find the engine.
ENV STOCKFISH_PATH=/usr/local/bin/stockfish

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
