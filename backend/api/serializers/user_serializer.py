from rest_framework import serializers

from api.models import User

class UserSerializer(serializers.ModelSerializer):

  class Meta:
    model = User
    fields = ("id", "email", "role", "first_name", "last_name", "is_staff")
    read_only_fields = ("id", "email", "role", "first_name", "last_name", "is_staff")

class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
      model = User
      fields = ("id", "email",)
      read_only_fields = ("id", "email",)

class FullUserSerializer(serializers.ModelSerializer):
  
  class Meta:
    model = User
    fields = ("id", "email", "role", "first_name", "last_name", "country", "residence", "age", "gender", "education", "employment", "job_fields", "unemployed_months",)
    read_only_fields = ("id", "email", "role", "first_name", "last_name", "country", "residence", "age", "gender", "education", "employment", "job_fields", "unemployed_months",)