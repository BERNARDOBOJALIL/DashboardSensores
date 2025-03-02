# Usa una imagen oficial de PHP con Apache
FROM php:8.2-apache

# Copia los archivos del proyecto al contenedor
COPY . /var/www/html/

# Expone el puerto 80 para el tráfico HTTP
EXPOSE 80

# Inicia Apache cuando el contenedor se ejecuta
CMD ["apache2-foreground"]
