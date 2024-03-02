FROM --platform=linux/amd64 node:20-alpine

COPY types ./types
COPY server/src ./server/src
COPY server/package.json /server/.
COPY server/tsconfig.json /server/.

WORKDIR /server
RUN npm install
RUN npm run build
RUN rm tsconfig.tsbuildinfo

ENV NODE_ENV=production
RUN npm install

EXPOSE 3000

CMD [ "node", "dist/server.js" ]