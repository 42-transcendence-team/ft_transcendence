FROM nginx:stable

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./conf.d/default.conf /etc/nginx/conf.d/default.conf

COPY ./ssl/nginx.crt /etc/ssl/certs/nginx.crt
COPY ./ssl/nginx.key /etc/ssl/private/nginx.key

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]