FROM --platform=linux/amd64 node:20-alpine

ENV NODE_ENV=production

COPY package.json .
COPY package-lock.json .
RUN yarn install
COPY dist ./dist

EXPOSE 3000

CMD [ "node", "dist/server.js" ]