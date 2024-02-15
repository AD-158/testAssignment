import json
import re
from datetime import datetime

from django.db import connection, DatabaseError
from django.db.models import Q
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from djangoAuth.views import decode_jwt_token
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import *
from .serializers import TEmployeesSerializer, TPositionSerializer


# Просто просмотр api
@api_view(['GET'])
def api_overview(request):
    api_urls = {
        'api-overview': '',
        'positions_JSON': '/positions_api/',
        'create position': '/positions_api/create/',
        'update position': '/positions_api/update/',
        'delete position': '/positions_api/delete/',
        'employees_JSON': '/positions_api/',
        'create employee': '/employees_api/create/',
        'update employee': '/employees_api/update/',
        'delete employee': '/employees_api/delete/',
        '--------------------------------------------The next - not api-------------------------------------------': '',
        'positionsPage': 'base_url/positions/',
        'employeesPage': 'base_url/employees/',
    }

    return Response(api_urls)


# Возврат числа должностей
@api_view(['GET'])
def get_positions_count(request):
    try:
        token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
        # а надо ли?
        auth_user = decode_jwt_token(token)['auth_user']
        try:
            try:
                search_query = request.GET.get('search')
            except:
                search_query = None
            if search_query is not None:
                positions = TPosition.objects.filter(
                    Q(t_position_id__icontains=search_query) |
                    Q(t_position_name__icontains=search_query)
                )
            else:
                positions = TPosition.objects.all()
            total_positions = positions.count()
            return JsonResponse({'total_positions': total_positions})
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
    except:
        return JsonResponse({'message': 'Unauthorized'}, status=401)


# Получение json списка должностей
@api_view(['GET'])
def get_positions(request):
    try:
        token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
        # а надо ли?
        auth_user = decode_jwt_token(token)['auth_user']
        try:
            try:
                search_query = request.GET.get('search')
            except:
                search_query = None
            if search_query is not None:
                positions = TPosition.objects.filter(
                    Q(t_position_id__icontains=search_query) |
                    Q(t_position_name__icontains=search_query)
                )
            else:
                positions = TPosition.objects.all()
            try:
                limit = int(request.GET.get('limit'))
            except:
                limit = 5
            p = Paginator(positions, limit)
            try:
                page_obj = p.get_page(int(request.GET.get('page')) + 1)
            except PageNotAnInteger:
                page_obj = p.page(1)
            except EmptyPage:
                page_obj = p.page(p.num_pages)
            serializer = TPositionSerializer(page_obj, many=True)
            return JsonResponse(data=serializer.data, safe=False)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
    except:
        return JsonResponse({'message': 'Unauthorized'}, status=401)


# Получение json всего списка должностей
@api_view(['GET'])
def get_all_positions(request):
    try:
        token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
        # а надо ли?
        auth_user = decode_jwt_token(token)['auth_user']
        try:
            positions = TPosition.objects.all().exclude(t_position_name__icontains='УДАЛЕН')
            serializer = TPositionSerializer(positions, many=True)
            return JsonResponse(data=serializer.data, safe=False)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
    except:
        return JsonResponse({'message': 'Unauthorized'}, status=401)


# Создание новой записи в списке должностей
@api_view(['POST'])
def create_position(request):
    try:
        with connection.cursor() as c:
            c.callproc("afunc_create_position_json", [json.dumps(request.data)])
            results = c.fetchone()
            if results is not None and results[0] == 201:
                return Response(status=status.HTTP_201_CREATED)
            else:
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)


# Изменение записи в списке должностей
@api_view(['PUT'])
def update_position(request):
    try:
        with connection.cursor() as c:
            c.callproc("afunc_update_position_json", [json.dumps(request.data)])
            results = c.fetchone()
            if results is not None and results[0] == 200:
                return Response(status=status.HTTP_200_OK)
            else:
                return Response('bad', status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)


# Удаление записи из списка должностей
@api_view(['DELETE'])
def delete_position(request):
    try:
        with connection.cursor() as c:
            position = request.data.get('t_position_id')
            if position is None:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            c.callproc("afunc_delete_position_json", [position])
            results = c.fetchone()
            if results is not None:
                if results[0] == 204:
                    return Response(status=status.HTTP_204_NO_CONTENT)
                elif results[0] == 500:
                    return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response(status=status.HTTP_400_BAD_REQUEST)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)


# Получение json списка сотрудников
@api_view(['GET'])
def get_employees(request):
    try:
        token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
        # а надо ли?
        auth_user = decode_jwt_token(token)['auth_user']
        try:
            try:
                search_query = request.GET.get('search')
            except:
                search_query = None
            if search_query is not None:
                employees = TEmployees.objects.filter(
                    Q(t_employees_id__icontains=search_query) |
                    Q(t_employees_last_name__icontains=search_query) |
                    Q(t_employees_first_name__icontains=search_query) |
                    Q(t_employees_patronymic__icontains=search_query) |
                    Q(t_employees_birth_date__icontains=search_query) |
                    Q(t_employees_position__t_position_name__icontains=search_query) |
                    Q(t_employees_residential_address__icontains=search_query)
                )
            else:
                employees = TEmployees.objects.all()
            try:
                limit = int(request.GET.get('limit'))
            except:
                limit = 5
            p = Paginator(employees, limit)
            try:
                page_obj = p.get_page(int(request.GET.get('page'))+1)
            except PageNotAnInteger:
                page_obj = p.page(1)
            except EmptyPage:
                page_obj = p.page(p.num_pages)
            serializer = TEmployeesSerializer(page_obj, many=True)
            return JsonResponse(data=serializer.data, safe=False)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
    except:
        return JsonResponse({'message': 'Unauthorized'}, status=401)


# Возврат числа сотрудников
@api_view(['GET'])
def get_employees_count(request):
    try:
        token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
        # а надо ли?
        auth_user = decode_jwt_token(token)['auth_user']
        try:
            try:
                search_query = request.GET.get('search')
            except:
                search_query = None
            if search_query is not None:
                employees = TEmployees.objects.filter(
                    Q(t_employees_id__icontains=search_query) |
                    Q(t_employees_last_name__icontains=search_query) |
                    Q(t_employees_first_name__icontains=search_query) |
                    Q(t_employees_patronymic__icontains=search_query) |
                    Q(t_employees_birth_date__icontains=search_query) |
                    Q(t_employees_position__t_position_name__icontains=search_query) |
                    Q(t_employees_residential_address__icontains=search_query)
                )
            else:
                employees = TEmployees.objects.all()
            total_employees = employees.count()
            return JsonResponse({'total_employees': total_employees})
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
    except:
        return JsonResponse({'message': 'Unauthorized'}, status=401)


# Создание новой записи в списке сотрудников
@api_view(['POST'])
def create_employee(request):
    try:
        # Проверка наличия всех необходимых полей
        required_fields = ['t_employees_last_name', 't_employees_first_name', 't_employees_birth_date',
                           't_employees_position', 't_employees_residential_address']
        if not all(field in request.data for field in required_fields):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Проверка возраста сотрудника
        birth_date = request.data['t_employees_birth_date']
        if (calculate_age(datetime.strptime(birth_date, '%Y-%m-%d'))) < 15:
            return Response({"error": "Employee must be at least 15 years old"}, status=status.HTTP_400_BAD_REQUEST)

        # Проверка ФИО на наличие только русских букв
        name_fields = ['t_employees_last_name', 't_employees_first_name', 't_employees_patronymic']
        for field in name_fields:
            print(field, request.data[field])
            if not re.match(r'^[а-яА-ЯёЁ]*$', request.data[field]):
                return Response({"error": "Name fields should contain only Russian letters"},
                                status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as c:
            c.callproc("afunc_create_employee_json", [json.dumps(request.data)])
            results = c.fetchone()
            if results is not None and results[0] == 201:
                return Response(status=status.HTTP_201_CREATED)
            else:
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)


# Изменение записи в списке сотрудников
@api_view(['PUT'])
def update_employee(request):
    try:
        with connection.cursor() as c:
            c.callproc("afunc_update_employee_json", [json.dumps(request.data)])
            results = c.fetchone()
            if results is not None and results[0] == 200:
                return Response(status=status.HTTP_200_OK)
            else:
                return Response('bad', status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)


# Удаление записи из списка должностей
@api_view(['DELETE'])
def delete_employee(request):
    try:
        with connection.cursor() as c:
            employee = request.data.get('t_employees_id')
            if employee is None:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            c.callproc("afunc_delete_employee_json", [employee])
            results = c.fetchone()
            if results is not None:
                if results[0] == 204:
                    return Response(status=status.HTTP_204_NO_CONTENT)
                elif results[0] == 500:
                    return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response(status=status.HTTP_400_BAD_REQUEST)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)


# Вычисление возраста
def calculate_age(born):
    today = datetime.today()
    age = today.year - born.year
    # Коррекция возраста, если день рождения еще предстоит в текущем году
    if (today.month, today.day) < (born.month, born.day):
        age -= 1
    return age