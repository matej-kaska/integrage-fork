import math
from api.models import ASGAnswer, ASGOneAnswer, ASGOption, ASGQuestion, DnDOption, Grade, MCAOption, OCAAnswer, MCAAnswer, DnDAnswer, OCAOption, Rating, SCLAnswer, SCLOption, SurveyResult, TextAnswer, Question, Topic, SurveyAttempt

from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import translation

from api.pagination import StandardPagination
from api.serializers.question_serializer import FullQuestionSerializer, FullSurveyAttemptSerializer, QuestionSerializer, SmallSurveyAttemptSerializer, SurveyAttemptSerializer, TopicSerializer, TopicSmallSerializer
from utils.crypto import decode_pk, encode_pk


class GetSurvey(APIView):

  def post(self, request):
    translation.activate(request.META.get('HTTP_ACCEPT_LANGUAGE'))
    survey_attempt_pk = request.data.get('survey_attempt')
    topic_pk = request.data.get('topic')

    if survey_attempt_pk is None and topic_pk is None:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)

    if topic_pk is not None and not request.user.is_anonymous:
      try:
        topic = Topic.objects.get(pk=topic_pk)
      except Topic.DoesNotExist:
        return Response({
          "en": "This topic does not exist",
          "cz": "Toto téma neexistuje"
        }, status=500)
      try:
        survey_attempt = SurveyAttempt.objects.filter(topic=topic, completed=False, user=request.user).last()
      except SurveyAttempt.DoesNotExist:
        return Response({
          "en": "This survey attempt does not exist",
          "cz": "Tento pokus o vyplnění dotazníku neexistuje"
        }, status=204)
      if survey_attempt is None:
        return Response({
          "en": "This survey attempt does not exist",
          "cz": "Tento pokus o vyplnění dotazníku neexistuje"
        }, status=204)
      questions = Question.objects.filter(id__in=survey_attempt.questions.all()).order_by('sub_topic__id', 'id')
      serializer = FullQuestionSerializer(questions, many=True, context={'survey_attempt': survey_attempt})
      return Response({"questions": serializer.data, "topic": {"pk": survey_attempt.topic.pk, "name": survey_attempt.topic.name}, "updated_at": survey_attempt.updated_at, "survey_attempt": encode_pk(survey_attempt.pk)}, status=200)

    try:
      if (survey_attempt_pk is None):
        return Response({
          "en": "Please fill all required fields",
          "cz": "Vyplňte prosím všechna povinná pole"
        }, status=204)
      survey_attempt = SurveyAttempt.objects.get(pk=decode_pk(survey_attempt_pk), completed=False)
    except SurveyAttempt.DoesNotExist:
      return Response({
        "en": "This survey attempt is invalid",
        "cz": "Tento pokus o vyplnění dotazníku je neplatný"
      }, status=404)
    
    questions = Question.objects.filter(id__in=survey_attempt.questions.all()).order_by('sub_topic__id', 'order', 'id')
    serializer = QuestionSerializer(questions, many=True)
    return Response({"questions": serializer.data, "topic": {"pk": survey_attempt.topic.pk, "name": survey_attempt.topic.name}, "updated_at": survey_attempt.updated_at}, status=200)

class GenerateSurvey(APIView):

  def post(self, request):
    topic_pk = request.data.get('topic')
    translation.activate(request.META.get('HTTP_ACCEPT_LANGUAGE'))

    if topic_pk is None:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)
    
    try:
      topic = Topic.objects.get(pk=topic_pk)
    except Topic.DoesNotExist:
      return Response({
        "en": "This topic does not exist",
        "cz": "Toto téma neexistuje"
      }, status=404)

    if topic_pk > 3:
      questions = Question.objects.all()
    else:
      questions = Question.objects.filter(sub_topic__topic=topic)

    if not request.user.is_anonymous:
      new_survey = SurveyAttempt.objects.create(user=request.user, topic=topic)
      new_survey.questions.set(questions)
      new_survey.save()
    else:
      new_survey = SurveyAttempt.objects.create(topic=topic)
      new_survey.questions.set(questions)
      new_survey.save()
    new_survey.save()

    encoded_survey_pk = encode_pk(new_survey.pk)

    for question in new_survey.questions.all():
      answer_model = {'OCA': OCAAnswer, 'MCA': MCAAnswer, 'DND': DnDAnswer, 'TXT': TextAnswer, 'ASG': ASGAnswer, 'SCL': SCLAnswer}.get(question.type)
      if answer_model.objects.filter(question=question, survey_attempt=new_survey).exists():
        continue
      if question.type == "ASG":
        asg_answer = answer_model.objects.create(question=question, survey_attempt=new_survey)
        one_answers = []
        for asg_question in ASGQuestion.objects.filter(question=question):
          one_answer = ASGOneAnswer.objects.create(asg_question=asg_question)
          one_answers.append(one_answer)
        asg_answer.answer.set(one_answers)
        asg_answer.save()
        continue
      answer_model.objects.create(question=question, survey_attempt=new_survey)

    serializer = QuestionSerializer(new_survey.questions.all().order_by('sub_topic__id', 'order', 'id'), many=True)
    return Response({"topic": {"pk": topic.pk, "name": topic.name},"survey_attempt": encoded_survey_pk, "questions": serializer.data}, status=201)
  
class SubmitSurvey(APIView):

  def post(self, request):
    translation.activate(request.META.get('HTTP_ACCEPT_LANGUAGE'))
    survey = request.data.get('survey')
    survey_attempt_pk = request.data.get('survey_attempt')
    complete = request.data.get('complete')
    updated_at = request.data.get('updated_at')

    if survey is None or survey_attempt_pk is None or updated_at is None:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)
    
    try:
      survey_attempt = SurveyAttempt.objects.get(pk=decode_pk(survey_attempt_pk))
    except SurveyAttempt.DoesNotExist:
      return Response({
        "en": "This survey attempt is invalid",
        "cz": "Tento pokus o vyplnění dotazníku je neplatný"
      }, status=404)
    
    survey_attempt.updated_at = updated_at
    survey_attempt.save()

    if survey_attempt.user is None and not request.user.is_anonymous:
      survey_attempt.user = request.user
      survey_attempt.save()

    # Update answers
    for questions in survey:
      question_pk = questions.get('id')
      answer = questions.get('answered')
      updated_at = questions.get('updated_at')
      started_at = questions.get('started_at')
      pasted = questions.get('pasted')
      question = Question.objects.get(pk=question_pk)
      answer_model = {'OCA': OCAAnswer, 'MCA': MCAAnswer, 'DND': DnDAnswer, 'TXT': TextAnswer, 'SCL': SCLAnswer, 'ASG': ASGAnswer}.get(question.type)
      new_answer = answer_model.objects.get(question=question, survey_attempt=survey_attempt)

      if new_answer.updated_at != updated_at:
        new_answer.started_at = started_at
        new_answer.updated_at = updated_at

        if answer is not None and answer != 0:
          self.update_answer(question, new_answer, answer, pasted)
        elif new_answer.answer is not None and answer is None:
          new_answer.answer.clear()
        new_answer.save()

    if complete and survey_attempt.completed is False:
      answer_models = [OCAAnswer, MCAAnswer, DnDAnswer, TextAnswer, SCLAnswer, ASGAnswer]
      for model in answer_models:
        answers = model.objects.filter(survey_attempt=survey_attempt)
        if not all(answer.answer is not None for answer in answers):
          return Response({
            "en": "All questions must be answered before submitting the survey",
            "cz": "Před odesláním dotazníku musíte odpovědět na všechny otázky"
          }, status=400)

      survey_results = self.generate_results(survey_attempt)
      if survey_results is None or len(survey_results) == 0:
        return Response({
          "en": "An error occurred while generating the survey results",
          "cz": "Při generování výsledků dotazníku došlo k chybě"
        }, status=500)

      survey_attempt.survey_result.set(survey_results)
      survey_attempt.completed = True
      survey_attempt.save()

      # Return results
      return Response({"message": "Survey successfully completed"}, status=200)

    return Response({"message": "Survey submitted successfully"}, status=200)
  
  def update_answer(self, question, answer_instance, answer, pasted):
    if question.type == 'OCA':
      oca_answer = OCAOption.objects.get(pk=answer)
      answer_instance.answer = oca_answer
      oca_answer.save()
    elif question.type == 'MCA':
      mca_answer = MCAOption.objects.filter(pk__in=answer)
      answer_instance.answer.set(mca_answer)
    elif question.type == 'DND':
      answer_instance.answer = answer
      answer_instance.save()
    elif question.type == 'TXT':
      answer_instance.answer = answer
      if pasted is None:
        answer_instance.pasted = False
      else:
        answer_instance.pasted = pasted
      answer_instance.save()
    elif question.type == 'ASG':
      for asg_question_pk, asg_option_pk in answer.items():
        try:
          asg_option = ASGOption.objects.get(pk=asg_option_pk)
          asg_question = ASGQuestion.objects.get(pk=asg_question_pk)
        except (ASGOption.DoesNotExist, ASGQuestion.DoesNotExist):
          print("ASG Option or ASG Question or ASG One Answer does not exist")
          continue
        asg_one_asnwer = answer_instance.answer.get(asg_question=asg_question)
        asg_one_asnwer.option = asg_option
        asg_one_asnwer.save()
      answer_instance.save()
    elif question.type == 'SCL':
      grade_answer = Grade.objects.get(pk=answer)
      answer_instance.answer = grade_answer
      answer_instance.save()

  def generate_results(self, survey_attempt):
    survey_results = []
    for sub_topic in survey_attempt.topic.subtopics.all():

      # Check if all questions are not evaluated
      should_make_result = False
      for question in survey_attempt.questions.filter(sub_topic=sub_topic):
        if question.evaluated is True:
          should_make_result = True
          break
      
      if should_make_result is False:
        continue

      total_points = 0
      actual_points = 0

      for question in survey_attempt.questions.filter(sub_topic=sub_topic):
        total_points += 1

        if question.evaluated is False:
          total_points -= 1
          continue

        if question.type == 'OCA':
          oca_answer = OCAAnswer.objects.get(question=question, survey_attempt=survey_attempt)
          if oca_answer.answer.is_correct:
            actual_points += 1
        
        elif question.type == 'MCA':
          all_answers = MCAOption.objects.filter(question=question)
          mca_answer = MCAAnswer.objects.get(question=question, survey_attempt=survey_attempt)
          mca_answer_ids = set(mca_answer.answer.values_list('id', flat=True))

          full_subpoints = all_answers.count()
          actual_subpoints = 0

          for answer in all_answers:
            correct = answer.is_correct
            answered = answer.id in mca_answer_ids

            if correct and answered:
              actual_subpoints += 1
            elif not correct and not answered:
              actual_subpoints += 1

          if isinstance(mca_answer,int) and mca_answer == 0:
            actual_subpoints = 0

          if full_subpoints > 0:
            actual_points += (actual_subpoints/full_subpoints)
          else:
            raise ZeroDivisionError("MCAAnswer is missing answer")
        
        elif question.type == 'DND':
          dnd_correct = DnDOption.objects.filter(question=question).order_by('correct_position').values_list('id', flat=True)
          dnd_answer = DnDAnswer.objects.get(question=question, survey_attempt=survey_attempt).answer
          
          full_subpoints = dnd_correct.count()
          actual_subpoints = 0

          actual_subpoints = sum(1 for correct_id, answer_id in zip(list(dnd_correct), dnd_answer) if correct_id == answer_id)

          if full_subpoints > 0:
            actual_points += (actual_subpoints/full_subpoints)
          else:
            raise ZeroDivisionError("DnDAnswer is missing answer")
        
        elif question.type == 'ASG':
          asg_questions = ASGQuestion.objects.filter(question=question)
          asg_answer = ASGAnswer.objects.get(question=question, survey_attempt=survey_attempt)
          answers_dict = {answer.asg_question.id: answer.option for answer in asg_answer.answer.all()}

          full_subpoints = asg_questions.count()
          actual_subpoints = 0

          for asg_question in asg_questions:
            try:
              selected_option = answers_dict.get(asg_question.id)
              if selected_option == asg_question.correct_option:
                actual_subpoints += 1
            except KeyError:
              print(f"No ASGAnswer for question {asg_question.id}")
          
          if full_subpoints > 0:
            actual_points += (actual_subpoints/full_subpoints)
          else:
            raise ZeroDivisionError("ASGAnswer is missing answer")
        
        elif question.type == 'SCL':
          scl_grades = SCLOption.objects.get(question=question).grade_type.grades
          scl_answer = SCLAnswer.objects.get(question=question, survey_attempt=survey_attempt)
          
          full_subpoints = scl_grades.count() - 1
          actual_subpoints = scl_answer.answer.point

          if full_subpoints > 0:
            actual_points += (actual_subpoints/(full_subpoints))
          else:
            raise ZeroDivisionError("SCLAnswer is missing answer")

        #print(f"Full subpoints: {full_subpoints}, Actual subpoints: {actual_subpoints} for question {question.id}")
      #print(f"Total points: {total_points}, Actual points: {actual_points}")

      if actual_points != 0:
        type=math.ceil((actual_points/total_points)*3)
      else:
        type=1

      if type > 3:
        type = 3

      selected_rating = Rating.objects.get(sub_topic=sub_topic,type=type)

      new_survey_result = SurveyResult.objects.create(
        sub_topic=sub_topic,
        rating=selected_rating,
        total_points=total_points,
        actual_points=actual_points
      )
      survey_results.append(new_survey_result)
    
    return survey_results

class Topics(APIView):

  def get(self, request):
    translation.activate(request.META.get('HTTP_ACCEPT_LANGUAGE'))
    queryset = Topic.objects.all()
    serializer = TopicSerializer(queryset, many=True)
    user = request.user
    if user is None or user.is_anonymous:
      return Response({"topics": serializer.data}, status=200)
    survey_attempts = SurveyAttempt.objects.filter(user=user).order_by('-updated_at')
    survey_serializer = SurveyAttemptSerializer(survey_attempts, many=True)
    return Response({"topics": serializer.data, "survey_attempts": survey_serializer.data} , status=200)
  
class TopicsList(APIView):
  
  def get(self, request):
    translation.activate(request.META.get('HTTP_ACCEPT_LANGUAGE'))
    queryset = Topic.objects.all()
    serializer = TopicSmallSerializer(queryset, many=True)
    return Response(serializer.data, status=200)
  
class ChangeLanguage(APIView):

  def post(self, request):
    translation.activate(request.META.get('HTTP_ACCEPT_LANGUAGE'))
    survey_attempt_pk = request.data.get('survey_attempt')
    survey_attempt = SurveyAttempt.objects.get(pk=decode_pk(survey_attempt_pk))
    questions = Question.objects.filter(id__in=survey_attempt.questions.all()).order_by('sub_topic__id', 'order', 'id')
    serializer = QuestionSerializer(questions, many=True)
    return Response({"questions": serializer.data, "topic": survey_attempt.topic.name}, status=200)
  
class ValidateSurveyAttempt(APIView):

  def post(self, request):
    survey_attempt_pk = request.data.get('survey_attempt')
    if survey_attempt_pk is None:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)
    try:
      survey_attempt = SurveyAttempt.objects.get(pk=decode_pk(survey_attempt_pk))
    except SurveyAttempt.DoesNotExist:
      return Response({
        "en": "This survey attempt is invalid",
        "cz": "Tento pokus o vyplnění dotazníku je neplatný"
      }, status=204)
    if survey_attempt.completed:
      return Response({
        "en": "This survey attempt is already completed",
        "cz": "Tento pokus o vyplnění dotazníku je již dokončený"
      }, status=204)
    if survey_attempt.user is not None and request.user.is_anonymous:
      return Response({
        "en": "This survey attempt is invalid",
        "cz": "Tento pokus o vyplnění dotazníku je neplatný"
      }, status=204)
    if survey_attempt.user is not None and survey_attempt.user != request.user:
      return Response({
        "en": "This survey attempt is invalid",
        "cz": "Tento pokus o vyplnění dotazníku je neplatný"
      }, status=204)
    return Response({"message": "Survey attempt is valid"}, status=200)

class GetSurveyAttempt(APIView):

  def get(self, request, encoded_id=None):
    translation.activate(request.META.get('HTTP_ACCEPT_LANGUAGE'))
    if encoded_id is None:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)
    try:
      survey_attempt = SurveyAttempt.objects.get(pk=decode_pk(encoded_id))
    except SurveyAttempt.DoesNotExist:
      return Response({
        "en": "This survey attempt is invalid",
        "cz": "Tento pokus o vyplnění dotazníku je neplatný"
      }, status=404)
    if survey_attempt.completed is False:
      return Response({
        "en": "This survey attempt is not completed",
        "cz": "Tento pokus o vyplnění dotazníku není dokončený"
      }, status=204)
    if survey_attempt.user is not None and survey_attempt.user != request.user:
      return Response({
        "en": "This survey attempt is invalid",
        "cz": "Tento pokus o vyplnění dotazníku je neplatný"
      }, status=204)
    
    if request.user.is_anonymous:
      survey_attempt = SurveyAttempt.objects.get(pk=decode_pk(encoded_id))
      serializer = FullSurveyAttemptSerializer(survey_attempt)
      return Response([serializer.data], status=200)
    
    last_survey_attempts = SurveyAttempt.objects.filter(
      user=request.user, completed=True, topic=survey_attempt.topic
    ).exclude(pk=survey_attempt.pk).order_by('-updated_at')[:4]

    all_attempts = [survey_attempt] + list(last_survey_attempts)

    serializer = FullSurveyAttemptSerializer(all_attempts, many=True)
    return Response(serializer.data, status=200)

class SurveyAttemptList(generics.ListAPIView):
  queryset = SurveyAttempt.objects.prefetch_related('survey_result')
  serializer_class = SmallSurveyAttemptSerializer
  permission_classes = (permissions.IsAuthenticated,)
  pagination_class = StandardPagination

  def get_queryset(self):
    return SurveyAttempt.objects.filter(user=self.request.user, completed=True).order_by('-updated_at')