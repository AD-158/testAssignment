import json
from datetime import datetime

import requests
from django.http import Http404
from django.shortcuts import render
from rest_framework import status

url = 'http://127.0.0.1:8000/api/'


# Страница "Список должностей"
def show_rendered_page_positions(request):
    try:
        # Получение списка должностей
        positions_list = None
        try:
            positions_response = requests.get(url + 'positions_api/', cookies=request.COOKIES)
            if positions_response.status_code == 200:
                positions_list = positions_response.json()
        except Exception as e:
            print(f"Error fetching positions: {e}")

        return render(request, 'Positions.html', {'positions_list': json.dumps(positions_list)})
    except Http404:
        raise Http404


# Страница "Список должностей"
def show_rendered_page_employees(request):
    try:
        # Получение списка должностей
        employees_list = None
        try:
            employees_response = requests.get(url + 'employees_api/', cookies=request.COOKIES)
            if employees_response.status_code == 200:
                employees_list = employees_response.json()
        except Exception as e:
            print(f"Error fetching employee: {e}")

        # Получение списка должностей
        positions_list = None
        try:
            positions_response = requests.get(url + 'positions_api/', cookies=request.COOKIES)
            if positions_response.status_code == 200:
                positions_list = positions_response.json()
        except Exception as e:
            print(f"Error fetching positions: {e}")

        return render(request, 'Employees.html', {
            'employees_list': json.dumps(employees_list),
            'positions_list': json.dumps(positions_list),
        })
    except Http404:
        raise Http404
