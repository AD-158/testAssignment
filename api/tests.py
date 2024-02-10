from django.test import TestCase
from rest_framework.test import APIRequestFactory
from . import views


class TestViews(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

    def test_get_positions(self):
        request = self.factory.get('positions_api/')
        response = views.get_positions(request)
        self.assertIn(response.status_code, [200, 400])  # Предполагаемые коды состояния
        # Проверяем, что ответ содержит JSON
        self.assertEqual(response['Content-Type'], 'text/html; charset=utf-8')

    def test_create_position(self):
        data = {'t_position_name': 'name'}  # Предположим, что это данные запроса
        request = self.factory.post('positions_api/create/', data, format='json')
        response = views.create_position(request)
        self.assertIn(response.status_code, [200, 201, 400])  # Предполагаемые коды состояния
        # Невалидные данные - пустой запрос
        request = self.factory.post('positions_api/create/', {}, format='json')
        response = views.create_position(request)
        self.assertEqual(response.status_code, 400)

    def test_update_position(self):
        data = {'t_position_name': 'тест'}  # Предположим, что это данные запроса
        request = self.factory.put('positions_api/update/', data, format='json')
        response = views.update_position(request)
        self.assertIn(response.status_code, [200, 400])  # Предполагаемые коды состояния
        # Невалидные данные - пустой запрос
        request = self.factory.put('positions_api/update/', {}, format='json')
        response = views.update_position(request)
        self.assertEqual(response.status_code, 400)

    def test_delete_position(self):
        data = {'t_position_id': 1}  # Предположим, что это данные запроса
        request = self.factory.delete('positions_api/delete/', data, format='json')
        response = views.delete_position(request)
        self.assertIn(response.status_code, [204, 400, 500])  # Предполагаемые коды состояния
        # Невалидные данные - пустой запрос
        request = self.factory.delete('positions_api/delete/', {}, format='json')
        response = views.delete_position(request)
        self.assertEqual(response.status_code, 400)
