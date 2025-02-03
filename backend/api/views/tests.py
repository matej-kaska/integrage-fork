from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework import generics
from django.template.loader import render_to_string
from api.models import User
from django.utils import translation

from django.utils.translation import gettext as t

class SQLTestViewSet(APIView):

  def get(self, request):
    unit = generics.get_object_or_404(User, pk=1)
    if (unit.email == "ujep@ujep.cz"):
      return JsonResponse({"message": "SQL is connected!"})
    else:
      return JsonResponse({"message": "Error"})
    
  def post(self, request):
    translation.activate("cs")
    template_args = {
      "email": "email",
      "link": "registration_link",
    }
    return JsonResponse({f'IntegrAGE - {t("Activation link")}': render_to_string("users/registration_link_email.txt", template_args)})