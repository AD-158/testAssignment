import json
from datetime import datetime

import requests
from django.http import Http404
from django.shortcuts import render
from rest_framework import status

url = 'http://127.0.0.1:8000/api/'
