FROM node:22-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y \
  chromium \
  ffmpeg \
  fonts-liberation \
  libnss3 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxkbcommon0 \
  libgbm1 \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx remotion browser ensure

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV RENDER_WORKER_PORT=3100
ENV RENDER_CONCURRENCY=2

EXPOSE 3100

CMD ["npx", "tsx", "render-worker/server.ts"]
