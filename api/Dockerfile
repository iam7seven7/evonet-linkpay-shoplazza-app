FROM node:24-alpine

RUN mkdir /app

WORKDIR /app

COPY package.json yarn.lock .

RUN yarn

COPY . .

#RUN yarn run prisma generate

RUN yarn run build

EXPOSE 3000

CMD ["yarn", "run", "start"]
