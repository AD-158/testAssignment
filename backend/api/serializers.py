from rest_framework import serializers

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
