FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --ignore-scripts


COPY . .

EXPOSE 3000

CMD ["pnpm", "start", "--host", "0.0.0.0"]