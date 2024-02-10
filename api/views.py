import json

from django.db import connection, DatabaseError
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


# Просто просмотр api
@api_view(['GET'])
def api_overview(request):
    api_urls = {
        'api-overview': '',
        'positions_JSON': '/positions_api/',
        '--------------------------------------------The next - not api-------------------------------------------': '',
        'homepage': 'base_url/home/',
    }

    return Response(api_urls)


# Получение json списка должностей
@api_view(['GET'])
def get_positions(request):
    try:
        with connection.cursor() as c:
            c.callproc("afunc_get_positions_json")
            results = c.fetchone()
            if results is not None:
                results = results[0]
            return Response(results)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)


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
            print(position)
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
















