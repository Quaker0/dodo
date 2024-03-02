FROM --platform=linux/amd64 node:20-alpine
COPY types ./types

WORKDIR /server
COPY src ./src
COPY package.json .
COPY tsconfig.json .
RUN npm install
RUN npm run build
RUN rm tsconfig.tsbuildinfo

COPY dist ./dist

ENV NODE_ENV=production
RUN npm install

EXPOSE 3000

CMD [ "node", "dist/server.js" ]