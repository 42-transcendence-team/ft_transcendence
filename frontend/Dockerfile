FROM node:20-slim

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
