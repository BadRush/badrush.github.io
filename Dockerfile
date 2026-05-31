FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy website files to the container
# .dockerignore filters out .git, docker-compose.yml, Dockerfile, node_modules, .env, etc.
COPY . /usr/share/nginx/html

# Defense-in-depth: remove any sensitive files that might slip through
RUN rm -rf /usr/share/nginx/html/.git \
           /usr/share/nginx/html/.gitignore \
           /usr/share/nginx/html/.dockerignore \
           /usr/share/nginx/html/Dockerfile \
           /usr/share/nginx/html/docker-compose*.yml \
           /usr/share/nginx/html/nginx.conf \
           /usr/share/nginx/html/package*.json \
           /usr/share/nginx/html/node_modules \
           /usr/share/nginx/html/.env* \
    && echo "Sensitive files cleanup done."

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
