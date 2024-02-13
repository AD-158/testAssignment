# Стартовый образ
FROM python:3.11-bullseye
# Автор
LABEL authors="ad-158"

# Рабочая директория
WORKDIR /usr/src/app
# Каталоги для статики
RUN mkdir -p $WORKDIR/django_static
RUN mkdir -p $WORKDIR/django_media

# Переменные окружения для python
# не создавать файлы кэша .pyc
ENV PYTHONDONTWRITEBYTECODE 1
# не помещать в буфер потоки stdout и stderr
ENV PYTHONUNBUFFERED 1

RUN apt-get update \
    && apt-get install -y postgresql postgresql-contrib gcc python3-dev musl-dev netcat

# Обновить pip
RUN pip install --upgrade pip

# Скопировать и установить зависимости, эта операция закешируется
# и будет перезапускаться только при изменении requirements.txt
COPY ./requirements.txt .
RUN pip install -r requirements.txt

COPY ./entrypoint.sh .

# Копировать всё что осталось.
COPY . .

RUN sed -i 's/\r$//g' /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]