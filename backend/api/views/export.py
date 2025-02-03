import csv
from io import StringIO
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import translation
from django.utils.dateparse import parse_datetime
from api.models import DnDAnswer, DnDOption, MCAAnswer, MCAOption, OCAAnswer, OCAOption, Question, SCLOption, SurveyAttempt, SurveyResult, Topic
from utils.translations import t
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

class CSVExport(APIView):
  permission_classes = (IsAuthenticated,)

  def post(self, request):
    language = request.data.get('language') or 'en'
    translation.activate(language)
    topic_pk = request.data.get('topic')
    country = request.data.get('country')
    time_from = request.data.get('time_from') or '1970-01-01T00:00:00Z'
    time_to = request.data.get('time_to') or '9999-12-31T23:59:59Z'

    if request.user.is_staff is False:
      return Response({
        "en": "Permission denied",
        "cz": "Přístup odepřen"
      }, status=403)

    if topic_pk is None or topic_pk == "null":
      return Response({
        "en": "Topic is required",
        "cz": "Téma je povinné"
      }, status=400)
    
    if country == "null" or country == "":
      country = None

    if time_from == "null" or time_from == "undefined":
      time_from = None

    if time_to == "null" or time_to == "undefined":
      time_to = None

    try:
      topic = Topic.objects.get(pk=topic_pk)
    except Topic.DoesNotExist:
      return Response({
        "en": "Topic not found",
        "cz": "Téma nebylo nalezeno"
      }, status=400)
    
    try:
      time_from = parse_datetime(time_from)
      time_to = parse_datetime(time_to)
    except ValueError:
      return Response({
        "en": "Invalid time format",
        "cz": "Neplatný formát času"
      }, status=400)
    
    if time_from > time_to:
      return Response({
        "en": "Invalid time range",
        "cz": "Neplatný časový rozsah"
      }, status=400)
    
    time_to_end_of_day = time_to.replace(hour=23, minute=59, second=59, microsecond=0)

    try:
      survey_attempts = SurveyAttempt.objects.filter(
        topic=topic_pk,
        created_at__range=[time_from, time_to_end_of_day],
        completed=True
      ).select_related('user').prefetch_related(
        'questions__sub_topic__topic',
        'questions__oca_options',
        'questions__mca_options',
        'questions__dnd_options',
        'questions__scl_options',
        'questions__asg_questions',
        'text_answers',
        'oca_answers__answer',
        'mca_answers__answer',
        'scl_answers__answer',
        'dnd_answers',
      )
    except SurveyAttempt.DoesNotExist:
      return Response({
        "en": "No survey attempts found",
        "cz": "Nebyly nalezeny žádné pokusy o vyplnění dotazníku"
      }, status=404)
    
    if country is not None:
      try:
        survey_attempts = survey_attempts.filter(user__country=country)
      except ValueError:
        return Response({
          "en": "Invalid country",
          "cz": "Neplatná země"
        }, status=400)

    output = StringIO()
    writer = csv.writer(output, delimiter=';', quoting=csv.QUOTE_NONNUMERIC)

    # Create headers
    survey_rows = ["country", "residence", "age", "gender", "education", "job_fields", "unemployed_months", "topic"]
    sub_topic = None
    for question in Question.objects.filter(sub_topic__topic=topic).order_by('sub_topic__id', 'order', 'id'):
      if question.sub_topic != sub_topic:
        sub_topic = question.sub_topic
        survey_rows.append(f"sub_topic_{sub_topic.id}")
        survey_rows.append(f"sub_topic_points_{sub_topic.id}")
        survey_rows.append(f"sub_topic_total_points_{sub_topic.id}")
        survey_rows.append(f"sub_topic_rank_{sub_topic.id}")
      if question.type == "OCA":
        survey_rows.append(f"oca_question_{question.id}")
        survey_rows.append(f"oca_answer_{question.id}")
        survey_rows.append(f"oca_correct_answer_{question.id}")
        survey_rows.append(f"oca_all_answers_{question.id}")
      if question.type == "MCA":
        survey_rows.append(f"mca_question_{question.id}")
        survey_rows.append(f"mca_answers_{question.id}")
        survey_rows.append(f"mca_correct_answers_{question.id}")
        survey_rows.append(f"mca_all_answers_{question.id}")
      if question.type == "DND":
        survey_rows.append(f"dnd_question_{question.id}")
        survey_rows.append(f"dnd_answers_{question.id}")
        survey_rows.append(f"dnd_correct_answers_{question.id}")
      if question.type == "ASG":
        i = 0
        for asg_question in question.asg_questions.all().order_by('id'):
          i += 1
          survey_rows.append(f"asg_question_{question.id}_{str(i)}")
          survey_rows.append(f"asg_answer_{question.id}_{str(i)}")
          survey_rows.append(f"asg_correct_answer_{question.id}_{str(i)}")
      if question.type == "SCL":
        survey_rows.append(f"scl_question_{question.id}")
        survey_rows.append(f"scl_answer_{question.id}")
        survey_rows.append(f"scl_points_{question.id}")
        survey_rows.append(f"scl_total_points_{question.id}")
      if question.type == "TXT":
        survey_rows.append(f"txt_question_{question.id}")
        survey_rows.append(f"txt_answer_{question.id}")
      survey_rows.append(f"evaluated_{question.id}")
    
    writer.writerow(survey_rows)

    # Create rows
    for survey_attempt in survey_attempts.order_by('-created_at'):
      new_row = get_user_data(survey_attempt.user, language)
      new_row.append(topic.name)
      sub_topic = None

      oca_answers = survey_attempt.oca_answers.all()
      mca_answers = survey_attempt.mca_answers.all()
      dnd_answers = survey_attempt.dnd_answers.all()
      asg_answers = survey_attempt.asg_answers.all()
      scl_answers = survey_attempt.scl_answers.all()
      txt_answers = survey_attempt.text_answers.all()
      oca_options = OCAOption.objects.filter(question__sub_topic__topic=topic).select_related('question')
      mca_options = MCAOption.objects.filter(question__sub_topic__topic=topic).select_related('question')
      dnd_options = DnDOption.objects.filter(question__sub_topic__topic=topic).select_related('question')
      scl_options = SCLOption.objects.filter(question__sub_topic__topic=topic).select_related('question')

      for question in survey_attempt.questions.all().order_by('sub_topic__id', 'order', 'id'):
        if question.sub_topic != sub_topic:
          sub_topic = question.sub_topic
          new_row.append(sub_topic.name)
          try:
            survey_result = survey_attempt.survey_result.get(sub_topic=sub_topic)
            new_row.append(survey_result.actual_points)
            new_row.append(survey_result.total_points)
            new_row.append(survey_result.rating.title)
          except SurveyResult.DoesNotExist:
            new_row.append(0)
            new_row.append(0)
            new_row.append("")

        if question.type == "OCA":
          new_row.append(question.text)
          try:
            oca_answer = oca_answers.get(question=question)
            new_row.append(oca_answer.answer.text)
          except OCAAnswer.DoesNotExist:
            new_row.append("NULL")
          options = oca_options.filter(question=question)
          try:
            answer = options.get(is_correct=True)
            new_row.append(answer.text)
          except OCAOption.DoesNotExist:
            new_row.append("")
          new_row.append(", ".join([option.text for option in options]))
          new_row.append(question.evaluated)
        if question.type == "MCA":
          new_row.append(question.text)
          mca_answer = mca_answers.get(question=question)
          if not mca_answer.answer.exists():
            new_row.append(t("QUESTION.NONE_OF_THE_ABOVE", language))
          else:
            try:
              mca_answer_texts = [option.text for option in mca_answer.answer.all()]
            except MCAAnswer.DoesNotExist:
              mca_answer_texts = ["NULL"]
            new_row.append(", ".join(mca_answer_texts))
          options = mca_options.filter(question=question)
          correct_mca_answers = [answer.text for answer in options.filter(is_correct=True)]
          new_row.append(", ".join(correct_mca_answers))
          new_row.append(", ".join([option.text for option in options]))
          new_row.append(question.evaluated)
        if question.type == "DND":
          new_row.append(question.text)
          try:
            dnd_answer_ids = [answer for answer in dnd_answers.get(question=question).answer]
            dnd_answer_texts = [dnd_options.get(pk=answer).text for answer in dnd_answer_ids]
          except DnDAnswer.DoesNotExist:
            dnd_answer_texts = ["NULL"]
          new_row.append(", ".join(dnd_answer_texts))
          correct_dnd_answers = [answer.text for answer in dnd_options.filter(question=question).order_by('correct_position')]
          new_row.append(", ".join(correct_dnd_answers))
          new_row.append(question.evaluated)
        if question.type == "ASG":
          asg_answer = asg_answers.get(question=question)
          for asg_question in question.asg_questions.all().order_by('id'):
            new_row.append(asg_question.text)
            new_row.append(asg_answer.answer.get(asg_question=asg_question).option.text)
            new_row.append(asg_question.correct_option.text)
          new_row.append(question.evaluated)
        if question.type == "SCL":
          scl_answer = scl_answers.get(question=question)
          new_row.append(question.text)
          new_row.append(scl_answer.answer.text)
          new_row.append(scl_answer.answer.point)
          new_row.append(scl_options.get(question=question).grade_type.grades.count() - 1)
          new_row.append(question.evaluated)
        if question.type == "TXT":
          txt_answer = txt_answers.get(question=question)
          new_row.append(question.text)
          new_row.append(txt_answer.answer)
          new_row.append(question.evaluated)
      writer.writerow(new_row)
    response = HttpResponse(output.getvalue(), content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="survey_attempts.csv"'
  
    output.close()

    return response

def get_user_data(user, language='en'):
  if user is None:
    return ["", "", "", "", "", "", ""]
  job_fields = [t(f"REGISTER.JOB_SECTORS.{field.upper()}", language) for field in user.job_fields]
  user_data = [
    user.country,
    t(f"REGISTER.RESIDENCE.{user.residence.upper()}", language),
    user.age,
    t(f"REGISTER.GENDERS.{user.gender.upper()}", language),
    t(f"REGISTER.EDUCATION.{user.education.upper()}", language),
    ", ".join(job_fields) if len(job_fields) > 0 else "",
    user.unemployed_months if user.unemployed_months is not None else "",
  ]
  return user_data

class AvailableSurveys(APIView):
  permission_classes = (IsAuthenticated,)

  def get(self, request):
    topic = request.GET.get('topic')
    country = request.GET.get('country')
    time_from = request.GET.get('time_from')
    time_to = request.GET.get('time_to')

    if topic is None or topic == "null":
      return Response({
        "en": "Topic is required",
        "cz": "Téma je povinné"
      }, status=400)
    
    if country == "null" or country == "":
      country = None

    if time_from == "null" or time_from == "undefined":
      time_from = None

    if time_to == "null" or time_to == "undefined":
      time_to = None

    survey_attempts = SurveyAttempt.objects.filter(topic=topic, completed=True)

    if country is not None:
      survey_attempts = survey_attempts.filter(user__country=country)
    
    if time_from is not None:
      survey_attempts = survey_attempts.filter(
        Q(created_at__gte=parse_datetime(time_from)) | Q(created_at=parse_datetime(time_from))
      )

    if time_to is not None:
      time_to_end_of_day = parse_datetime(time_to).replace(hour=23, minute=59, second=59, microsecond=0)
      survey_attempts = survey_attempts.filter(
        Q(created_at__lte=time_to_end_of_day) | Q(created_at=time_to_end_of_day)
      )
    
    return Response(survey_attempts.count(), status=200)