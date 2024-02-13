from django.urls import path
from . import views

urlpatterns = [
    path(r'', views.api_overview, name="api_overview"),

    path(r'positions_api/', views.get_positions, name="positions_api"),
    path(r'positions_api/filtered/', views.get_all_positions),
    path(r'positions_api/count/', views.get_positions_count),
    path(r'positions_api/create/', views.create_position),
    path(r'positions_api/update/', views.update_position),
    path(r'positions_api/delete/', views.delete_position),

    path(r'employees_api/', views.get_employees, name="employees_api"),
    path(r'employees_api/count/', views.get_employees_count),
    path(r'employees_api/create/', views.create_employee),
    path(r'employees_api/update/', views.update_employee),
    path(r'employees_api/delete/', views.delete_employee),
]