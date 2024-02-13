# Стартовый образ
FROM node:19-bullseye as build

# Автор
LABEL authors="ad-158"

# Рабочая директория
WORKDIR /usr/src/app

# JSON файлы
ADD *.json ./

# Установка всех пакетов и зависимостей, указанных в JSON
RUN npm install

# Скопировать каталоги public и src.
ADD ./public ./public
ADD ./src ./src