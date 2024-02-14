from django.shortcuts import redirect
from django.utils.deprecation import MiddlewareMixin


class RedirectEmptyUrlMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path == '/':
            return redirect('employees/')
