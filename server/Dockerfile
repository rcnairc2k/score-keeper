FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Compile TS to JS
RUN npm run build
EXPOSE 8080
CMD ["node", "dist/index.js"]
