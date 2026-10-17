FROM node:24-bookworm-slim

# Install Stockfish and Prisma's OpenSSL dependency.
    && apt-get install -y --no-install-recommends stockfish openssl \
    && rm -rf /var/lib/apt/lists/*

# Tell the backend where to find Stockfish.
ENV STOCKFISH_PATH=/usr/games/stockfish

WORKDIR /app

COPY package*.json ./

RUN npm ci

RUN chown -R node:node /app/node_modules

COPY . .

EXPOSE 3000

CMD ["npm", "start"]