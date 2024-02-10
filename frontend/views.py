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
