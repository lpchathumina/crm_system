FROM php:8.4-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    mysql-client \
    mariadb-connector-c-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    redis \
    oniguruma-dev

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    zip \
    mbstring \
    bcmath \
    opcache \
    pcntl \
    sockets

# Install Redis extension
RUN apk add --no-cache autoconf g++ make \
    && pecl install redis \
    && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:2.10 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer files first for layer caching
COPY composer.json composer.lock ./

RUN composer install --no-scripts --no-autoloader --no-interaction --prefer-dist

# Copy application files
COPY . .

RUN composer dump-autoload --optimize --no-dev

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# PHP config
COPY docker/php.ini /usr/local/etc/php/conf.d/app.ini

# Nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8001

ENTRYPOINT ["/entrypoint.sh"]
