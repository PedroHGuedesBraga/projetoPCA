FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

RUN chown -R node:node /app

USER node 

CMD ["npm", "start"]