FROM nginx:stable

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./conf.d/default.conf /etc/nginx/conf.d/default.conf

COPY ./ssl/nginx.crt /etc/ssl/certs/nginx.crt
COPY ./ssl/nginx.key /etc/ssl/private/nginx.key

EXPOSE 1312
EXPOSE 6969

CMD ["nginx", "-g", "daemon off;"]

# TODO - Añadir certificados SSL de Let's Encrypt para producción. Para desarrollo, se pueden usar certificados autofirmados.