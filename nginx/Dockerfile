# Стартовый образ
FROM nginx:1.25.3

# Автор
LABEL authors="ad-158"

# Удалить дефолтный конфиг
RUN rm /etc/nginx/conf.d/default.conf

# Заменить кастомным
COPY nginx.conf /etc/nginx/conf.d/