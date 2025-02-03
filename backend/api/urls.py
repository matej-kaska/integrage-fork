from django.http import JsonResponse
from django.urls import path

from api.views.tests import SQLTestViewSet
from api.views.survey import ChangeLanguage, GenerateSurvey, SubmitSurvey, Topics, GetSurvey, TopicsList, ValidateSurveyAttempt, GetSurveyAttempt, SurveyAttemptList
from api.views.users import PasswordResetView, RegisterView, RegisterValidatedView, ObtainAuthToken, RequestPasswordResetView, UserViewSet, FullUserViewSet, UserUpdateView, PasswordChangeView, UserDeleteView
from api.views.export import AvailableSurveys, CSVExport

urlpatterns = [
  path("test/connection", lambda req: JsonResponse({"message": "Backend is connected!"})),
  path("test/sql", SQLTestViewSet.as_view()),

  path("survey/topics", Topics.as_view()),
  path("survey/topic/list", TopicsList.as_view()),
  path("survey/generate", GenerateSurvey.as_view()),
  path("survey/get", GetSurvey.as_view()),
  path("survey/change-language", ChangeLanguage.as_view()),
  path("survey/submit", SubmitSurvey.as_view()),
  path("survey/attempt/validate", ValidateSurveyAttempt.as_view()),
  path("survey/attempt/<str:encoded_id>", GetSurveyAttempt.as_view()),
  path("survey/attempts", SurveyAttemptList.as_view()),

  path("user/token", ObtainAuthToken.as_view()),
  path("user/me", UserViewSet.as_view()),
  path("user/me/full", FullUserViewSet.as_view()),
  path("user/update", UserUpdateView.as_view()),
  path("user/register", RegisterView.as_view()),
  path("user/register/validate", RegisterValidatedView.as_view()),
  path("user/password/request", RequestPasswordResetView.as_view()),
  path("user/password/reset", PasswordResetView.as_view()),
  path("user/password/change", PasswordChangeView.as_view()),
  path("user/delete", UserDeleteView.as_view()),

  path("export", CSVExport.as_view()),
  path("export/count", AvailableSurveys.as_view()),
]