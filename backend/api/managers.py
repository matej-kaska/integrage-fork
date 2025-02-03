from django.contrib.auth.base_user import BaseUserManager


class CustomUserManager(BaseUserManager):
  """
  Custom user model manager where email is the unique identifiers
  for authentication instead of usernames.
  """
  def create_user(self, email, password, role="user", **extra_fields):
    """
    Create and save a user with the given email and password.
    """
    if not email:
      raise ValueError(("The Email must be set"))
    email = self.normalize_email(email)
    user = self.model(email=email, role=role, **extra_fields)
    user.set_password(password)
    user.save()
    return user

  def create_superuser(self, email, password, **extra_fields):
    """
    Create and save a SuperUser with the given email and password.
    """
    extra_fields.setdefault("is_staff", True)
    extra_fields.setdefault("is_superuser", True)
    extra_fields.setdefault("is_active", True)
    extra_fields.setdefault("role", 'admin')
    extra_fields.setdefault("first_name", "")
    extra_fields.setdefault("last_name", "")
    extra_fields.setdefault("country", "")
    extra_fields.setdefault("residence", "")
    extra_fields.setdefault("age", 0)
    extra_fields.setdefault("gender", "")
    extra_fields.setdefault("education", "")
    extra_fields.setdefault("employment", False)
    extra_fields.setdefault("job_fields", [""])
    extra_fields.setdefault("unemployed_months", 0) 

    if extra_fields.get("is_staff") is not True:
      raise ValueError(("Superuser must have is_staff=True."))
    if extra_fields.get("is_superuser") is not True:
      raise ValueError(("Superuser must have is_superuser=True."))
    return self.create_user(email, password, **extra_fields)