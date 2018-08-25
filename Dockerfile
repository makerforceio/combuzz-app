FROM kyma/docker-nginx
COPY native/ /var/www
CMD 'nginx'