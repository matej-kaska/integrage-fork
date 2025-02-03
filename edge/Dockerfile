FROM alpine:3
RUN apk add --no-cache brotli nginx nginx-mod-http-brotli

COPY integrage.conf /etc/nginx/http.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80