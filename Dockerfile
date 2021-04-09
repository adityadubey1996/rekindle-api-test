FROM node:10.16

WORKDIR /app

COPY package*.json ./

COPY .npmrc ./

RUN npm ci --only=production --unsafe-perm=true

COPY . .

EXPOSE 3000

CMD ["node", "bin/www"]