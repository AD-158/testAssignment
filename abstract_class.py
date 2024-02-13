import json
from abc import ABC, abstractmethod
from datetime import datetime

# На основе абстрактного класса создать 2 класса для записи и чтения сообщений.
# •	первый класс пишет сообщения в формате txt;
# •	второй класс пишет сообщения в формате json.
# Создать класс, с помощью которого можно сохранять и читать сообщения.
# Реализовать функции класса
# •	запись сообщения;
# •	вывести все сообщения.
# Атрибуты сообщения
# •	дата;
# •	пользователь;
# •	текст.


class Message:
    def __init__(self, user, text):
        self.date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.user = user
        self.text = text


class MessageManager(ABC):
    @abstractmethod
    def write_message(self, message):
        pass

    @abstractmethod
    def read_messages(self):
        pass


class TxtMessageManager(MessageManager):
    def write_message(self, message):
        with open('messages.txt', 'a+') as file:
            file.write(f"{message.date} - {message.user}: {message.text}\n")

    def read_messages(self):
        try:
            with open('messages.txt', 'r') as txt_file:
                for line in txt_file:
                    print(line.strip())
        except FileNotFoundError:
            print("Txt file not found.")


class JsonMessageManager(MessageManager):
    def write_message(self, message):
        with open('messages.json', 'a+') as file:
            json.dump({"date": message.date, "user": message.user, "text": message.text}, file)
            file.write('\n')

    def read_messages(self):
        try:
            with open('messages.json', 'r') as json_file:
                for line in json_file:
                    message = json.loads(line)
                    print(f"{message['date']} - {message['user']}: {message['text']}")
        except FileNotFoundError:
            print("Json file not found.")


class MessageManager:
    def __init__(self, manager):
        self.manager = manager

    def write_a_message(self, message):
        self.manager.write_message(message)

    def read_all_messages(self):
        self.manager.read_messages()


txt_writer = TxtMessageManager()
# json_writer = JsonMessageManager()

message1 = Message("user1", "Hello world!")
message2 = Message("user2", "Here we go again...")

MessageManager(txt_writer).write_a_message(message1)
MessageManager(txt_writer).write_a_message(message2)
# MessageManager(json_writer).write_a_message(message1)
# MessageManager(json_writer).write_a_message(message2)

MessageManager(txt_writer).read_all_messages()
# MessageManager(json_writer).read_all_messages()
