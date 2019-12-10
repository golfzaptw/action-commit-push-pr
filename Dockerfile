FROM node:12-alpine

LABEL "com.github.actions.name"="Commit Push And PR"
LABEL "com.github.actions.description"="Automatically commits and push files which have been changed and pull request."
LABEL "com.github.actions.icon"="upload-cloud"
LABEL "com.github.actions.color"="blue"

LABEL "repository"="http://github.com/golfzaptw/action-commit-push-pr"
LABEL "homepage"="http://github.com/golfzaptw/action-commit-push-pr#readme"
LABEL "maintainer"="Patawee Boonsongsri <psgolf16@gmail.com>"

# Install git
RUN apk add git-lfs

# Copy package.json and install
COPY package.json ./
RUN yarn
COPY src/index.js src/index.js

ENTRYPOINT ["node", "/src/index.js"]
