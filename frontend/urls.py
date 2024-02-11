from django.urls import path
from . import views

urlpatterns = [
    path('positions/', views.show_rendered_page_positions, name="positions"),
    path('employees/', views.show_rendered_page_employees, name="employees"),
]
