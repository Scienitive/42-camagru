FROM php:8.2-fpm

RUN apt-get update -y && apt-get install -y libpng-dev libjpeg-dev libgd-dev
RUN docker-php-ext-install pdo_mysql
RUN docker-php-ext-install gd

WORKDIR /var/www/html