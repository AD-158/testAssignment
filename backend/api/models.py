from django.db import models


class TEmployees(models.Model):
    t_employees_id = models.AutoField(primary_key=True)
    t_employees_last_name = models.CharField(max_length=75)
    t_employees_birth_date = models.DateField()
    t_employees_position = models.ForeignKey('TPosition', models.DO_NOTHING, db_column='t_employees_position')
    t_employees_residential_address = models.CharField(max_length=255)
    t_employees_first_name = models.CharField(max_length=50)
    t_employees_patronymic = models.CharField(max_length=75, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 't_employees'


class TPosition(models.Model):
    t_position_id = models.AutoField(primary_key=True)
    t_position_name = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 't_position'
