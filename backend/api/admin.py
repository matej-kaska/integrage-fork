from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from modeltranslation.admin import TranslationAdmin
from django import forms
from .models import ASGAnswer, ASGOneAnswer, ASGOption, ASGQuestion, Grade, GradeType, SCLAnswer, SCLOption, SubTopic, Topic, User, Question, OCAOption, MCAOption, DnDOption, SurveyAttempt, OCAAnswer, MCAAnswer, DnDAnswer, TextAnswer, RegistrationCode, PasswordResetCode, Image, Rating, SurveyResult
from django.db.models import Q

class CustomUserAdmin(UserAdmin):
  model = User
  list_display = ['email', 'role', 'is_active', 'is_staff', 'is_superuser', 'get_groups']
  list_filter = ['role', 'is_active', 'is_staff', 'is_superuser', 'groups']
  fieldsets = (
    (None, {'fields': ('email', 'password', 'role', 'first_name', 'last_name', 'country', 
    'residence', 'age', 'gender', 'education', 'employment', 'job_fields', 'unemployed_months')}),
    (('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    (('Important dates'), {'fields': ('last_login', 'date_joined')}),
  )
  add_fieldsets = (
    (None, {'classes': ('wide',),
    'fields': ('email', 'password1', 'password2', 'role', 'first_name', 'last_name', 'country', 
    'residence', 'age', 'gender', 'education', 'employment', 'job_fields', 'unemployed_months',
    'is_active', 'is_staff', 'is_superuser', 'groups')}),
  )
  search_fields = ('email',)
  ordering = ('email',)

  def get_groups(self, obj):
    return "\n".join([g.name for g in obj.groups.all()])
  get_groups.short_description = 'Groups'

class QuestionForm(forms.ModelForm):
  class Meta:
    model = Question
    fields = ['type', 'sub_topic', 'text', 'order', 'can_be_none', 'evaluated']

  def clean(self):
    cleaned_data = super().clean()
    question_type = cleaned_data.get('type')
    can_be_none = cleaned_data.get('can_be_none')
    
    if question_type != 'MCA' and can_be_none:
      self.add_error('can_be_none', 'This field can only be true for MCA questions.')

class OCAOptionForm(forms.ModelForm):
  class Meta:
    model = OCAOption
    fields = ['question', 'text', 'is_correct']

  def __init__(self, *args, **kwargs):
    super(OCAOptionForm, self).__init__(*args, **kwargs)
    self.fields['question'].queryset = Question.objects.filter(type='OCA').order_by('-id')

class MCAOptionForm(forms.ModelForm):
  class Meta:
    model = MCAOption
    fields = ['question', 'text', 'is_correct']

  def __init__(self, *args, **kwargs):
    super(MCAOptionForm, self).__init__(*args, **kwargs)
    self.fields['question'].queryset = Question.objects.filter(type='MCA').order_by('-id')

class DnDOptionForm(forms.ModelForm):
  class Meta:
    model = DnDOption
    fields = ['question', 'text', 'correct_position']

  def __init__(self, *args, **kwargs):
    super(DnDOptionForm, self).__init__(*args, **kwargs)
    self.fields['question'].queryset = Question.objects.filter(type='DND').order_by('-id')

class ASGOptionForm(forms.ModelForm):
  class Meta:
    model = ASGOption
    fields = ['question', 'text']

  def __init__(self, *args, **kwargs):
    super(ASGOptionForm, self).__init__(*args, **kwargs)
    self.fields['question'].queryset = Question.objects.filter(type='ASG').order_by('-id')

class ASGQuestionForm(forms.ModelForm):
  class Meta:
    model = ASGQuestion
    fields = ['question', 'text', 'correct_option']

  def __init__(self, *args, **kwargs):
    super(ASGQuestionForm, self).__init__(*args, **kwargs)
    self.fields['question'].queryset = Question.objects.filter(type='ASG').order_by('-id')
    self.fields['correct_option'].queryset = ASGOption.objects.all().order_by('-id')

class SCLOptionForm(forms.ModelForm):
  class Meta:
    model = SCLOption
    fields = ['question', 'grade_type']

  def __init__(self, *args, **kwargs):
    super(SCLOptionForm, self).__init__(*args, **kwargs)
    self.fields['question'].queryset = Question.objects.filter(type='SCL').order_by('-id')

class GradeTypeForm(forms.ModelForm):
  class Meta:
    model = GradeType
    fields = ['name', 'grades']

  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    if self.instance.pk:
      self.fields['grades'].queryset = Grade.objects.filter(
        Q(grade_types__isnull=True) | Q(grade_types=self.instance)
      ).distinct()
    else:
      self.fields['grades'].queryset = Grade.objects.filter(
        grade_types__isnull=True
      ).distinct()

class GradeForm(forms.ModelForm):
  class Meta:
    model = Grade
    fields = ['text', 'point']

@admin.register(OCAOption)
class OCAOptionAdmin(TranslationAdmin):
  form = OCAOptionForm
  list_display = ['option_display']

  def option_display(self, obj):
    return f"[{obj.pk}] (Q: {obj.question.pk}) (C: {obj.is_correct}) {obj.text}"
  option_display.short_description = 'OCA Option Details'

@admin.register(MCAOption)
class MCAOptionAdmin(TranslationAdmin):
  form = MCAOptionForm
  list_display = ['option_display']

  def option_display(self, obj):
    return f"[{obj.pk}] (Q: {obj.question.pk}) (C: {obj.is_correct}) {obj.text}"
  option_display.short_description = 'MCA Option Details'

@admin.register(DnDOption)
class DnDOptionAdmin(TranslationAdmin):
  form = DnDOptionForm
  list_display = ['option_display']

  def option_display(self, obj):
    return f"[{obj.pk}] (Q: {obj.question.pk}) (C: {obj.correct_position}) {obj.text}"
  option_display.short_description = 'DnD Option Details'

@admin.register(ASGOption)
class ASGOptionAdmin(TranslationAdmin):
  form = ASGOptionForm
  list_display = ['option_display']

  def option_display(self, obj):
    return f"[{obj.pk}] (Q: {obj.question.pk}) {obj.text}"
  option_display.short_description = 'ASG Option Details'

@admin.register(ASGQuestion)
class ASGQuestionAdmin(TranslationAdmin):
  form = ASGQuestionForm
  list_display = ['option_display']

  def option_display(self, obj):
    return f"[{obj.pk}] (Q: {obj.question.pk}) (CO: {obj.correct_option.pk}) {obj.text}"
  option_display.short_description = 'ASG Question Details'

@admin.register(Grade)
class GradeAdmin(TranslationAdmin):
  form = GradeForm
  list_display = ['option_display']

  def option_display(self, obj):
    return f"[{obj.pk}] (P: {obj.point}) {obj.text}"
  option_display.short_description = 'Grade Details'

@admin.register(Question)
class QuestionAdmin(TranslationAdmin):
  form = QuestionForm
  list_display = ['question_display']

  def question_display(self, obj):
    return f"[{obj.pk}] ({obj.type}) (ST: {obj.sub_topic}) {obj.text}"

  question_display.short_description = 'Question Details'

@admin.register(Topic)
class TopicAdmin(TranslationAdmin):
  list_display = ['topic_display']

  def topic_display(self, obj):
    return f"[{obj.pk}] {obj.name}"
  topic_display.short_description = 'Topic Details'

@admin.register(SubTopic)
class SubTopicAdmin(TranslationAdmin):
  list_display = ['subtopic_display']

  def subtopic_display(self, obj):
    return f"[{obj.pk}] (T: {obj.topic.name}) {obj.name}"
  subtopic_display.short_description = 'Sub Topic Details'

@admin.register(Rating)
class RatingAdmin(TranslationAdmin):
  list_display = ['rating_display']

  def rating_display(self, obj):
    return f"[{obj.pk}] ({obj.sub_topic.name} - {obj.type}) {obj.title}"
  rating_display.short_description = 'Rating Details'

class SurveyResultForm(forms.ModelForm):
  class Meta:
    model = SurveyResult
    fields = ['sub_topic', 'rating', 'total_points', 'actual_points']

  def __init__(self, *args, **kwargs):
    super(SurveyResultForm, self).__init__(*args, **kwargs)
    self.fields['sub_topic'].queryset = SubTopic.objects.order_by('-id')
    self.fields['rating'].queryset = Rating.objects.order_by('-id')

@admin.register(SurveyAttempt)
class SurveyAttemptAdmin(admin.ModelAdmin):
  list_display = ('id', 'topic', 'user', 'completed', 'created_at', 'total_questions', 'answered_questions', 'answer_percentage')
  list_filter = ('completed', 'created_at', 'topic')
  search_fields = ('user__email', 'topic__title')

  def display_user(self, obj):
    return obj.user.email if obj.user else "Anonymous"
  display_user.short_description = "User"

  def get_queryset(self, request):
    queryset = super().get_queryset(request)
    queryset = queryset.prefetch_related('oca_answers', 'mca_answers', 'dnd_answers', 'text_answers', 'asg_answers', 'scl_answers').select_related('topic')
    return queryset

@admin.register(SCLOption)
class SCLOptionAdmin(admin.ModelAdmin):
  form = SCLOptionForm

@admin.register(GradeType)
class GradeTypeAdmin(admin.ModelAdmin):
  form = GradeTypeForm

@admin.register(SurveyResult)
class SurveyResultAdmin(admin.ModelAdmin):
  form = SurveyResultForm

admin.site.register(User, CustomUserAdmin)
admin.site.register(OCAAnswer)
admin.site.register(MCAAnswer)
admin.site.register(DnDAnswer)
admin.site.register(TextAnswer)
admin.site.register(ASGAnswer)
admin.site.register(ASGOneAnswer)
admin.site.register(SCLAnswer)
admin.site.register(Image)
admin.site.register(RegistrationCode)
admin.site.register(PasswordResetCode)