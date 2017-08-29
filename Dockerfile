FROM node:6.2.0
ENV NODE_ENV production

WORKDIR /app

ADD package.json package.json
RUN npm install

ADD . .

EXPOSE 3000
CMD ["node", "./src/server/server.babel.js"]
