FROM node:16

RUN mkdir /nodejs
WORKDIR /nodejs
COPY ./ ./test
COPY package.json ./
COPY package-lock.json ./
RUN npm install

CMD ["npm", "start"]

