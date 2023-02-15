# Base image
FROM node:16-alpine
RUN apk update && apk add bash
# Create app directory
WORKDIR /usr/src/app

ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true \
NEW_RELIC_LOG=stdout
# etc.
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY nest-cli.json ./

# Install app dependencies
RUN npm ci

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

COPY src/core/mail/template /usr/src/app/dist/core/mail/

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
