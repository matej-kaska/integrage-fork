from rest_framework import serializers
from api.models import ASGAnswer, ASGOption, DnDOption, MCAOption, Question, OCAOption, ASGQuestion, Rating, SCLAnswer, SCLOption, SubTopic, SurveyAttempt, Topic, OCAAnswer, MCAAnswer, DnDAnswer, TextAnswer, Image
from utils.crypto import encode_pk
import random

class OCAOptionSerializer(serializers.ModelSerializer):
  class Meta:
    model = OCAOption
    fields = ['id', 'text']

class MCAOptionSerializer(serializers.ModelSerializer):
  class Meta:
    model = MCAOption
    fields = ['id', 'text']

class DNDOptionSerializer(serializers.ModelSerializer):
  class Meta:
    model = DnDOption
    fields = ['id', 'text']

class ASGOptionSerializer(serializers.ModelSerializer):
  class Meta:
    model = ASGOption
    fields = ['id', 'text']

class ASGQuestionSerializer(serializers.ModelSerializer):
  class Meta:
    model = ASGQuestion
    fields = ['id', 'text']

class SCLOptionSerializer(serializers.ModelSerializer):
  grades = serializers.SerializerMethodField()

  class Meta:
    model = SCLOption
    fields = ['grades']

  def get_grades(self, obj):
    grades = obj.grade_type.grades.all()
    return [{"id": grade.pk, "text": grade.text, "point": grade.point} for grade in grades]

class TopicSerializer(serializers.ModelSerializer):
  class Meta:
    model = Topic
    fields = ['id', 'name', 'description']

class TopicSmallSerializer(serializers.ModelSerializer):
  class Meta:
    model = Topic
    fields = ['id', 'name']

class SubTopicQuestionSerializer(serializers.ModelSerializer):

  class Meta:
    model = SubTopic
    fields = ['id', 'name']

class QuestionSerializer(serializers.ModelSerializer):
  oca_options = OCAOptionSerializer(many=True, read_only=True)
  mca_options = MCAOptionSerializer(many=True, read_only=True)
  dnd_options = DNDOptionSerializer(many=True, read_only=True)
  asg_options = ASGOptionSerializer(many=True, read_only=True)
  asg_questions = ASGQuestionSerializer(many=True, read_only=True)
  scl_options = SCLOptionSerializer(many=True, read_only=True)
  sub_topic = SubTopicQuestionSerializer(read_only=True)
  images = serializers.SerializerMethodField()
  can_be_none = serializers.SerializerMethodField()

  class Meta:
    model = Question
    fields = ['id', 'text', 'type', 'images', 'sub_topic', 'oca_options', 'mca_options', 'dnd_options', 'asg_options', 'asg_questions', 'scl_options', 'can_be_none']

  def get_can_be_none(self, obj):
    if obj.type == 'MCA' and obj.can_be_none:
      return True
    return False

  def get_images(self, obj):
    images = Image.objects.filter(question=obj)
    return [image.image.url for image in images]

  def to_representation(self, instance):
    data = super(QuestionSerializer, self).to_representation(instance)
    if data['scl_options']:
      data['scl_options'] = data['scl_options'][0]['grades']
    if not data['oca_options']:
      data.pop('oca_options')
    else:
      random.shuffle(data['oca_options'])
    if not data['mca_options']:
      data.pop('mca_options')
    else:
      random.shuffle(data['mca_options'])
    if not data['dnd_options']:
      data.pop('dnd_options')
    else:
      options = DnDOption.objects.filter(question=instance).order_by('correct_position')
      correct_order = [option.id for option in options]
      current_order = [dnd_option['id'] for dnd_option in data['dnd_options']]
      while current_order == correct_order:
        random.shuffle(data['dnd_options'])
        current_order = [dnd_option['id'] for dnd_option in data['dnd_options']]
    if not data['asg_options']:
      data.pop('asg_options')
    else:
      random.shuffle(data['asg_options'])
    if not data['asg_questions']:
      data.pop('asg_questions')
    else:
      random.shuffle(data['asg_questions'])
    if not data['scl_options']:
      data.pop('scl_options')
    if not data['images']:
      data.pop('images')
    if not data['type'] == 'MCA':
      data.pop('can_be_none')
    return data

class FullQuestionSerializer(serializers.ModelSerializer):
  oca_options = OCAOptionSerializer(many=True, read_only=True)
  mca_options = MCAOptionSerializer(many=True, read_only=True)
  dnd_options = DNDOptionSerializer(many=True, read_only=True)
  asg_options = ASGOptionSerializer(many=True, read_only=True)
  asg_questions = ASGQuestionSerializer(many=True, read_only=True)
  scl_options = SCLOptionSerializer(many=True, read_only=True)
  sub_topic = SubTopicQuestionSerializer(read_only=True)
  images = serializers.SerializerMethodField()
  answered = serializers.SerializerMethodField()
  started_at = serializers.SerializerMethodField()
  updated_at = serializers.SerializerMethodField()
  pasted = serializers.SerializerMethodField()

  class Meta:
    model = Question
    fields = ['id', 'text', 'type', 'sub_topic', 'oca_options', 'mca_options', 'dnd_options', 'asg_options', 'asg_questions', 'scl_options', 'answered', 'started_at', 'updated_at', 'pasted', 'images']

  def get_answered(self, obj):
    survey_attempt = self.context.get('survey_attempt')
    try:
      if obj.type == 'OCA':
        oca_answer = OCAAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
        return oca_answer.answer.id if oca_answer.answer else None
      elif obj.type == 'MCA':
        mca_answer = MCAAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
        return list(mca_answer.answer.values_list('id', flat=True))
      elif obj.type == 'DND':
        dnd_answer = DnDAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
        return dnd_answer.answer
      elif obj.type == 'TXT':
        text_answer = TextAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
        return text_answer.answer
      elif obj.type == 'ASG':
        asg_answer = ASGAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
        dict_answer = {}
        for answer in asg_answer.answer.all():
          dict_answer[answer.asg_question.pk] = 0
          if answer.option:
            dict_answer[answer.asg_question.pk] = answer.option.pk
        return dict_answer
      elif obj.type == 'SCL':
        scl_answer = SCLAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
        return scl_answer.answer.id if scl_answer.answer else None
    except (OCAAnswer.DoesNotExist, MCAAnswer.DoesNotExist, DnDAnswer.DoesNotExist, TextAnswer.DoesNotExist, ASGAnswer.DoesNotExist, SCLAnswer.DoesNotExist):
      return None

    return None

  def get_started_at(self, obj):
    survey_attempt = self.context.get('survey_attempt')
    if obj.type == 'OCA':
      answer = OCAAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
    elif obj.type == 'MCA':
      answer = MCAAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
    elif obj.type == 'DND':
      answer = DnDAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
    elif obj.type == 'TXT':
      answer = TextAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
    elif obj.type == 'ASG':
      answer = ASGAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
    elif obj.type == 'SCL':
      answer = SCLAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
    else:
      return None
    return answer.started_at if answer else None

  def get_updated_at(self, obj):
    survey_attempt = self.context.get('survey_attempt')
    if obj.type == 'OCA':
      answer = OCAAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
    elif obj.type == 'MCA':
      answer = MCAAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
    elif obj.type == 'DND':
      answer = DnDAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
    elif obj.type == 'TXT':
      answer = TextAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
    elif obj.type == 'ASG':
      answer = ASGAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
    elif obj.type == 'SCL':
      answer = SCLAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
    else:
      return []
    return answer.updated_at if answer and answer.updated_at else []
  
  def get_pasted(self, obj):
    survey_attempt = self.context.get('survey_attempt')
    if obj.type == 'TXT':
      answer = TextAnswer.objects.get(question=obj, survey_attempt=survey_attempt)
      return answer.pasted if answer else None
    return None

  def get_images(self, obj):
    images = Image.objects.filter(question=obj)
    return [image.image.url for image in images]

  def to_representation(self, instance):
    data = super().to_representation(instance)
    if data['scl_options']:
      data['scl_options'] = data['scl_options'][0]['grades']
    if not data['oca_options']:
      data.pop('oca_options')
    if not data['mca_options']:
      data.pop('mca_options')
    if not data['dnd_options']:
      data.pop('dnd_options')
    if not data['asg_options']:
      data.pop('asg_options')
    if not data['asg_questions']:
      data.pop('asg_questions')
    if not data['scl_options']:
      data.pop('scl_options')
    if not data['images']:
      data.pop('images')
    if not data['pasted']:
      data.pop('pasted')
    return data
  
class SurveyAttemptSerializer(serializers.ModelSerializer):
  id = serializers.SerializerMethodField()

  class Meta:
    model = SurveyAttempt
    fields = ['id', 'topic', 'created_at', 'completed', 'updated_at']

  def get_id(self, obj):
    return encode_pk(obj.pk)
  
  def to_representation(self, instance):
    data = super(SurveyAttemptSerializer, self).to_representation(instance)
    data['retryable'] = False
    data['fetched'] = True
    return data

class RatingSerializer(serializers.ModelSerializer):
  class Meta:
    model = Rating
    fields = ['id', 'title', 'description']

class FullSurveyAttemptSerializer(serializers.ModelSerializer):
  topic = serializers.SerializerMethodField()
  results = serializers.SerializerMethodField()
  id = serializers.SerializerMethodField()

  class Meta:
    model = SurveyAttempt
    fields = ['id', 'topic', 'created_at', 'updated_at', 'results']

  def get_id(self, obj):
    return encode_pk(obj.pk)

  def get_topic(self, obj):
    return {"id": obj.topic.id, "name": obj.topic.name}
  
  def get_results(self, obj):
    results = obj.survey_result.all().select_related('sub_topic', 'rating')
    return [
      {
        "sub_topic":
          {
          "id": result.sub_topic.id,
          "name": result.sub_topic.name
          },
        "rating": RatingSerializer(result.rating).data,
        "total_points": result.total_points,
        "actual_points": result.actual_points
      } for result in results
    ]

class SmallSurveyAttemptSerializer(serializers.ModelSerializer):
  topic = serializers.SerializerMethodField()
  results = serializers.SerializerMethodField()
  id = serializers.SerializerMethodField()

  class Meta:
    model = SurveyAttempt
    fields = ['id', 'topic', 'created_at', 'updated_at', 'results']

  def get_id(self, obj):
    return encode_pk(obj.pk)

  def get_topic(self, obj):
    return {"id": obj.topic.id, "name": obj.topic.name}
  
  def get_results(self, obj):
    results = obj.survey_result.all().select_related('sub_topic', 'rating')
    return [
      {
        "id": result.pk,
        "total_points": result.total_points,
        "actual_points": result.actual_points
      } for result in results
    ]