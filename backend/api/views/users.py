from datetime import timedelta
import os
import random
import string
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from rest_framework.authtoken.views import ObtainAuthToken as DefaultObtainAuthToken
from rest_framework.authtoken.models import Token
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from api.models import PasswordResetCode, RegistrationCode, User
from django.utils.translation import gettext as t
from api.serializers.user_serializer import UserSerializer, FullUserSerializer
from rest_framework.permissions import IsAuthenticated

class ObtainAuthToken(DefaultObtainAuthToken):

  def post(self, request, *args, **kwargs):
    email = request.data['email']
    password = request.data['password']

    try:
      user = User.objects.get(email=email)
    except User.DoesNotExist:
      return Response({
        "en": "Invalid credentials",
        "cz": "Neplatné přihlašovací údaje"
      }, status=400)

    if not user.check_password(password):
      return Response({
        "en": "Invalid credentials",
        "cz": "Neplatné přihlašovací údaje"
      }, status=400)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
      'token': token.key,
    })

class UserViewSet(APIView):
  permission_classes = (IsAuthenticated,)
  serializer_class = UserSerializer

  def get(self, request):
    user = request.user
    serializer = self.serializer_class(user)
    return Response(serializer.data)
    
class FullUserViewSet(APIView):
  permission_classes = (IsAuthenticated,)
  serializer_class = FullUserSerializer

  def get(self, request):
    user = request.user
    serializer = self.serializer_class(user)
    return Response(serializer.data)

class UserUpdateView(APIView):
  permission_classes = (IsAuthenticated,)
  serializer_class = FullUserSerializer

  def put(self, request):
    first_name = request.data.get('firstName')
    last_name = request.data.get('lastName')
    country = request.data.get('location')
    residence = request.data.get('residence')
    age = request.data.get('age')
    gender = request.data.get('gender')
    education = request.data.get('education')
    employment = request.data.get('employment')
    job_fields = request.data.get('jobField')
    unemployed_months = request.data.get('unemployedMonths')

    if not country or not first_name or not last_name or not residence or not age or not gender or not education: 
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)
    
    if not isinstance(employment, bool):
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)

    if not job_fields and not unemployed_months:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)
    
    user = User.objects.get(id=request.user.id)
    if not user:
      return Response({
        "en": "User not found",
        "cz": "Uživatel nenalezen"
      }, status=400)
    
    user.first_name = first_name
    user.last_name = last_name
    user.country = country
    user.residence = residence
    user.age = age
    user.gender = gender
    user.education = education
    user.employment = employment
    user.job_fields = job_fields
    user.unemployed_months = unemployed_months
    user.save()
    
    serializer = self.serializer_class(user)
    return Response(serializer.data, status=200)

class RegisterView(APIView):
    
  def post(self, request):
    first_name = request.data.get('firstName')
    last_name = request.data.get('lastName')
    email = request.data.get('email')
    country = request.data.get('location')
    residence = request.data.get('residence')
    age = request.data.get('age')
    gender = request.data.get('gender')
    education = request.data.get('education')
    employment = request.data.get('employment')
    job_fields = request.data.get('jobField')
    unemployed_months = request.data.get('unemployedMonths')
    password = request.data.get('password')
    password_again = request.data.get('confirmPwd')
    gdpr = request.data.get('gdpr')

    if not password or not password_again or not email or not gdpr or not country or not first_name or not last_name or not residence or not age or not gender or not education: 
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)
    
    if not isinstance(employment, bool):
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)

    if not job_fields and not unemployed_months:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)

    if password != password_again:
      return Response({
        "en": "Passwords don't match",
        "cz": "Hesla se neshodují"
      }, status=400)

    if len(password) < 8:
      return Response({
        "en": "Password length must be at least 8 characters",
        "cz": "Heslo je příliš krátké"
      }, status=400)

    if len(password) > 100:
      return Response({
        "en": "Password must be at most 100 characters long",
        "cz": "Heslo je příliš dlouhé"
      }, status=400)

    try:
      validate_email(email)
    except ValidationError:
      return Response({
        "en": "Invalid e-mail",
        "cz": "Neplatný e-mail"
      }, status=400)

    if User.objects.filter(email=email).exists():
      return Response({
        "en": "This e-mail is already taken",
        "cz": "E-mail je již zabraný"
      }, status=400)
    
    registration_code = RegistrationCode.objects.filter(email=email).all()
    for rc in registration_code:
      if rc.created_at > timezone.now() - timedelta(minutes=5):
        return Response({
          "en": "You have already requested a registration link, wait 5 minutes before requesting another one",
          "cz": "Již jste požádali o odkaz na registraci, počkejte 5 minut před dalším požadavkem"
        }, status=400)

    # Send e-mail with validation link
    code = "".join([random.choice(string.ascii_letters + string.digits) for _ in range(64)])
    registration_code = RegistrationCode.objects.create(
      first_name=first_name,
      last_name=last_name,
      country=country,
      residence=residence,
      age=age,
      gender=gender,
      education=education,
      employment=employment,
      job_fields=job_fields,
      unemployed_months=unemployed_months,
      email=email,
      code=code,
      password=make_password(password),
    )

    url_base = os.environ.get("DJANGO_BASE_URL", "https://satool.ujep.cz/") + "/"
    registration_link = f"{url_base}login?registration-token={registration_code.code}"

    template_args = {
      "email": email,
      "link": registration_link,
    }

    html_message = render_to_string("users/registration_link_email.html", template_args)
    txt_message = render_to_string("users/registration_link_email.txt", template_args)

    send_mail(
      subject=f'IntegrAGE - {t("Activation link")}',
      message=txt_message,
      html_message=html_message,
      from_email=os.environ.get("DJANGO_EMAIL_FROM", "integrage@hotmail.com"),
      recipient_list=[email],
    )

    return Response(status=200)

class RegisterValidatedView(APIView):

  def post(self, request):
    code = request.data.get('token')

    if not code:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)
    
    token = RegistrationCode.objects.get(code=code)

    if not token:
      return Response({
        "en": "This activation link doesn't exist",
        "cz": "Tento odkaz neexistuje"
      }, status=400)
    
    if token.used:
      return Response({
        "en": "This activation link was already used",
        "cz": "Tento odkaz byl již použit"
      }, status=400)
    
    if token.created_at < timezone.now() - timedelta(hours=24):
      return Response({
        "en": "This activation link already expired",
        "cz": "Tento odkaz již vypršel"
      }, status=400)
    
    if User.objects.filter(email=token.email).exists():
      return Response({
        "en": "This e-mail is already taken",
        "cz": "Tento e-mail je již zabraný"
      }, status=400)

    # Create user
    user = User(
      first_name=token.first_name,
      last_name=token.last_name,
      country=token.country,
      residence=token.residence,
      age=token.age,
      gender=token.gender,
      education=token.education,
      employment=token.employment,
      job_fields=token.job_fields,
      unemployed_months=token.unemployed_months,
      email=token.email,
      password=token.password,
    )

    user.save()

    token.used = True
    token.save()

    return Response(status=201)

class RequestPasswordResetView(APIView):

  def post(self, request):
    email = request.data.get('email')

    if not email:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)

    try:
      validate_email(email)
    except ValidationError:
      return Response({
        "en": "Invalid e-mail",
        "cz": "Neplatný e-mail"
      }, status=400)

    user = get_object_or_404(User, email=email)

    reset_code = PasswordResetCode.objects.filter(user=user).all()
    for rc in reset_code:
      if rc.created_at > timezone.now() - timedelta(minutes=5):
        return Response({
          "en": "You have already requested a password reset link, wait 5 minutes before requesting another one",
          "cz": "Již jste požádali o odkaz na obnovení hesla, počkejte 5 minut před dalším požadavkem"
        }, status=400)

    code = "".join([random.choice(string.ascii_letters + string.digits) for _ in range(64)])
    reset_code = PasswordResetCode.objects.create(
      user=user,
      code=code,
    )

    url_base = os.environ.get("DJANGO_BASE_URL", "https://satool.ujep.cz/") + "/"
    reset_link = f"{url_base}login?reset-token={reset_code.code}"

    template_args = {
      "email": user.email,
      "link": reset_link,
    }
    html_message = render_to_string("users/password_reset_email.html", template_args)
    txt_message = render_to_string("users/password_reset_email.txt", template_args)

    send_mail(
      subject=f'IntegrAGE - {t("Reset password")}',
      message=txt_message,
      html_message=html_message,
      from_email=os.environ.get("DJANGO_EMAIL_FROM", "integrage@hotmail.com"),
      recipient_list=[email],
    )

    return Response(status=200)

class PasswordResetView(APIView):

  def post(self, request):
    code = request.data.get('token')
    new_password = request.data.get('password')
    new_password_again = request.data.get('confirmPwd')

    if not code:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)

    if not new_password or not new_password_again:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)
    
    if new_password != new_password_again:
      return Response({
        "en": "New passwords do not match",
        "cz": "Nová hesla se neshodují"
      }, status=400)

    if len(new_password) < 8:
      return Response({
        "en": "New password length must be at least 8 characters",
        "cz": "Nové heslo musí mít alespoň 8 znaků"
      }, status=400)
    
    if len(new_password) > 100:
      return Response({
        "en": "Password must be at most 100 characters long",
        "cz": "Nové heslo je příliš dlouhé"
      }, status=400)

    try:
      reset_code = PasswordResetCode.objects.get(code=code)
    except PasswordResetCode.DoesNotExist:
      return Response({
        "en": "This reset link doesn't exist",
        "cz": "Neplatný kód pro obnovení hesla"
      }, status=400)
    
    if reset_code.used:
      return Response({
        "en": "This reset link was already used",
        "cz": "Tento odkaz byl již použit"
      }, status=400)
    
    if reset_code.created_at < timezone.now() - timedelta(hours=1):
      return Response({
        "en": "This reset link has expired",
        "cz": "Tento odkaz na obnovení hesla vypršel"
      }, status=400)

    user = reset_code.user

    user.set_password(new_password)
    user.save()

    reset_code.used = True
    reset_code.save()

    return Response(status=200)

class PasswordChangeView(APIView):

  def put(self, request):
    old_password = request.data.get('oldPassword')
    new_password = request.data.get('newPassword')
    new_password_again = request.data.get('confirmPassword')

    if not new_password or not new_password_again or not old_password:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)
    
    if new_password != new_password_again:
      return Response({
        "en": "New passwords do not match",
        "cz": "Nová hesla se neshodují"
      }, status=400)

    if len(new_password) < 8:
      return Response({
        "en": "New password length must be at least 8 characters",
        "cz": "Nové heslo musí mít alespoň 8 znaků"
      }, status=400)
    
    if len(new_password) > 100:
      return Response({
        "en": "Password must be at most 100 characters long",
        "cz": "Nové heslo je příliš dlouhé"
      }, status=400)

    user = User.objects.get(id=request.user.id)

    if not user:
      return Response({
        "en": "User not found",
        "cz": "Uživatel nenalezen"
      }, status=400)

    if not user.check_password(old_password):
      return Response({
        "en": "Old password is incorrect",
        "cz": "Staré heslo je nesprávné"
      }, status=400)

    user.set_password(new_password)
    user.save()

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
      'token': token.key,
    }, status=200)
  
class UserDeleteView(APIView):
  permission_classes = (IsAuthenticated,)

  def delete(self, request):
    password = request.data.get('password')

    if not password:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)
    
    user = User.objects.get(id=request.user.id)

    if not user.check_password(password):
      return Response({
        "en": "Password is incorrect",
        "cz": "Heslo je nesprávné"
      }, status=400)
    
    user.delete()
    return Response(status=200)