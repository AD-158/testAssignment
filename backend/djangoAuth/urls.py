from django.urls import path
from .views import log_me, refresh_token, revoke_token, return_name

urlpatterns = [
    path('login/', log_me, name='login'),
    path('username/', return_name, name='username'),
    path('refresh/', refresh_token, name='refresh_token'),
    path('revoke/', revoke_token, name='revoke_token'),
]