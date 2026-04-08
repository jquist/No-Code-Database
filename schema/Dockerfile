FROM node:20

WORKDIR /app

COPY ./package.json ./
RUN npm install

COPY . .

ENV PORT=7070

EXPOSE 7070

CMD ["npm", "start"]
