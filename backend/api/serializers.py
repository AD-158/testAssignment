from rest_framework import serializers
from rest_framework.pagination import PageNumberPagination

from .models import TEmployees, TPosition


class TPositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TPosition
        fields = ('t_position_id', 't_position_name')


class TEmployeesSerializer(serializers.ModelSerializer):
    t_employees_position = TPositionSerializer()

    class Meta:
        model = TEmployees
        fields = (
            't_employees_id', 't_employees_last_name', 't_employees_first_name', 't_employees_patronymic',
            't_employees_birth_date', 't_employees_position', 't_employees_residential_address')


class TEmployeesPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100
