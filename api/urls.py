from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_overview, name="api_overview"),

    path('positions_api/', views.get_positions, name="positions_api"),
    path('positions_api/create/', views.create_position),
    path('positions_api/update/', views.update_position),
    path('positions_api/delete/', views.delete_position),

    path('employees_api/', views.get_employees, name="employees_api"),
    path('employees_api/create/', views.create_employee),
    path('employees_api/update/', views.update_employee),
    path('employees_api/delete/', views.delete_employee),
]