import json
import uuid
from datetime import datetime, timedelta
import jwt
from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.contrib.auth import login, authenticate, logout
from . import models


@api_view(['GET'])
def return_name(request):
    try:
        token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
        # а надо ли?
        auth_user = decode_jwt_token(token)['auth_user']
        return JsonResponse({'username': request.user.username})
    except:
        return JsonResponse({'message': 'Unauthorized'}, status=401)


# Генерация JWT токенов
def generate_jwt_token(auth_user):
    # Пока что так генерируется более долгий (refresh) токен, лежащий в базе
    r_token = str(uuid.uuid4())
    # Нагрузка короткоживущего (access) токена
    payload = {
        'auth_user': auth_user,
        'exp': datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRATION),
        'iat': datetime.utcnow()
    }
    # Генерируется access токен
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token, r_token


# Расшифровка JWT токена
def decode_jwt_token(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


# Авторизация в системе
@api_view(['POST'])
def log_me(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        stay_logged_in = request.data.get('stay_logged_in')
        if stay_logged_in:
            mx_age = 3153600
        else:
            request.session.set_expiry(0)
            mx_age = 43200
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                auth_user = user.id
                token, r_token = generate_jwt_token(auth_user)
                ip = request.META.get('HTTP_X_FORWARDED_FOR').split(',')[-1].strip() if (
                        request.META.get('HTTP_X_FORWARDED_FOR') is not None) \
                    else request.META.get('REMOTE_ADDR')
                auth_user = models.AuthUser.objects.get(pk=auth_user)
                token_ua = request.headers['user-agent']
                models.RefreshToken.objects.create(auth_user=auth_user, token_ua=token_ua,
                                            token_exp=datetime.utcnow() + timedelta(minutes=mx_age),
                                            token_iat=datetime.utcnow(), token_ip=ip, token_value=r_token)
                response = JsonResponse({'access': token})
                response.set_cookie('refresh', value=r_token, max_age=mx_age, httponly=True)
                return response
            else:
                return JsonResponse({'message': 'Unauthorized'}, status=401)
        else:
            return JsonResponse({'message': 'Unauthorized'}, status=401)
    except:
        return JsonResponse({'message': 'Unauthorized'}, status=401)


# Обновление токенов по истечению access токена
def refresh_token(request):
    r_token = request.COOKIES.get('refresh')
    mx_age = 3153600 if request.session.get_expiry_age() == 0 else 43200
    try:
        # Если токен поврежден (или просрочен)- отозвать его
        if decode_jwt_token(json.loads(request.body.decode('utf-8'))['access']) is None:
            revoke_token(request)
        else:
            refresh_token_obj = models.RefreshToken.objects.get(token_value=r_token)
            if refresh_token_obj:
                ip = request.META.get('HTTP_X_FORWARDED_FOR').split(',')[-1].strip() if (
                        request.META.get('HTTP_X_FORWARDED_FOR') is not None) \
                    else request.META.get('REMOTE_ADDR')
                # TODO добавить логирование попытки взлома
                if refresh_token_obj.token_ip != ip:
                    revoke_token(request)
                    # return JsonResponse({'error': 'Changed IP address! ATTENTION!'}, status=403)
                elif refresh_token_obj.token_ua != request.headers['user-agent']:
                    revoke_token(request)
                    # return JsonResponse({'error': 'Changed User-Agent! ATTENTION!'}, status=403)
                # elif refresh_token_obj.token_exp.timestamp() < datetime.utcnow().timestamp():
                #     revoke_token(request)
                    # return JsonResponse({'error': 'Token expired! ATTENTION!'}, status=403)
                else:
                    new_token, new_refresh_token = generate_jwt_token(
                        decode_jwt_token(json.loads(request.body.decode('utf-8'))['access'])['auth_user'])
                    refresh_token_obj.token_value = new_refresh_token
                    refresh_token_obj.token_iat = datetime.utcnow()
                    refresh_token_obj.token_exp = datetime.utcnow() + timedelta(minutes=mx_age)
                    refresh_token_obj.save(update_fields=["token_value", "token_exp", "token_iat"])
                    response = JsonResponse({'access': new_token})
                    response.set_cookie('refresh', value=new_refresh_token, max_age=mx_age, httponly=True)
                    return response
    except models.RefreshToken.DoesNotExist:
        pass
    return JsonResponse({'error': 'Invalid refresh token'}, status=401)


# Выход из системы
def revoke_token(request):
    logout(request)
    r_token = request.COOKIES.get('refresh')
    try:
        refresh_token_obj = models.RefreshToken.objects.get(token_value=r_token)
        if refresh_token_obj:
            refresh_token_obj.delete()
            return JsonResponse({'message': 'Token revoked'})
    except models.RefreshToken.DoesNotExist:
        pass
    return JsonResponse({'error': 'Invalid refresh token'}, status=401)
