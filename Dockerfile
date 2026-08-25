# Official Playwright image ships Node + all browser binaries + OS deps preinstalled.
FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .

ENV CI=true

CMD ["npx", "playwright", "test"]
