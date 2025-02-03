from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.forms import ValidationError
from .managers import CustomUserManager
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Q, Min

# Custom user model
class User(AbstractUser):
  ROLE_CHOICES = (
    ('user', 'User'),
    ('analytic', 'Analytic'),
    ('admin', 'Admin'),
  )

  email = models.EmailField(unique=True)
  role = models.CharField(max_length=8, choices=ROLE_CHOICES, default='user')
  first_name = models.CharField(max_length=100)
  last_name = models.CharField(max_length=100)
  country = models.CharField(max_length=50)
  residence = models.CharField(max_length=50)
  age = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(150)])
  gender = models.CharField(max_length=50)
  education = models.CharField(max_length=50)
  employment = models.BooleanField()
  job_fields = ArrayField(models.CharField(max_length=100, blank=True))
  unemployed_months = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(1000)], null=True)

  username = None

  USERNAME_FIELD = "email"
  REQUIRED_FIELDS = []

  objects = CustomUserManager()

  groups = models.ManyToManyField(
    Group,
    verbose_name='groups',
    blank=True,
    help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
    related_name="custom_user_set",
    related_query_name="user",
  )
  user_permissions = models.ManyToManyField(
    Permission,
    verbose_name='user permissions',
    blank=True,
    help_text='Specific permissions for this user.',
    related_name="custom_user_set",
    related_query_name="user",
  )

  def __str__(self):
    return self.email
  
  def __repr__(self):
    return f"[{self.pk}] {self.email}"

# Model of the question
class Question(models.Model):
  QUESTION_TYPES = (
    ('OCA', 'One Correct Answer'),
    ('MCA', 'Multiple Correct Answers'),
    ('DND', 'Drag and Drop'),
    ('TXT', 'Text Answer'),
    ('SCL', 'Scale'),
    ('ASG', 'Assign')
  )

  text = models.TextField()
  type = models.CharField(max_length=3, choices=QUESTION_TYPES)
  sub_topic = models.ForeignKey('SubTopic', on_delete=models.CASCADE, related_name='questions', db_index=True)
  evaluated = models.BooleanField(default=True)
  can_be_none = models.BooleanField(default=False)
  order = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(1000)], null=True, blank=True)

  class Meta:
    verbose_name = "Question"
    verbose_name_plural = "Questions"
  
  def __str__(self):
    return f"[{self.pk}] {self.text}"
  
  def __repr__(self):
    return f"[{self.pk}] ({self.type}) {self.text}"

  def clean(self):
    super().clean()
    if self.type != 'MCA' and self.can_be_none:
      raise ValidationError({'can_be_none': 'This field can only be true for MCA questions.'})

class Topic(models.Model):
  name = models.CharField(max_length=99)
  description = models.CharField(max_length=1024)

  class Meta:
    verbose_name = "Topic"
    verbose_name_plural = "Topics"

  def __str__(self):
    return f"[{self.pk}] {self.name}"
  
  def __repr__(self):
    return f"[{self.pk}] {self.name}"

class SubTopic(models.Model):
  name = models.CharField(max_length=99)
  topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='subtopics', db_index=True)

  class Meta:
    verbose_name = "Sub Topic"
    verbose_name_plural = "Sub Topics"

  def __str__(self):
    return f"[{self.pk}] (T: {self.topic.name}) {self.name}"
  
  def __repr__(self):
    return f"[{self.pk}] (T: {self.topic.name}) {self.name}"

# Models of the options
class OCAOption(models.Model):
  question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='oca_options', db_index=True)
  text = models.CharField(max_length=255)
  is_correct = models.BooleanField(default=False)

  class Meta:
    verbose_name = "OCA Option"
    verbose_name_plural = "OCA Options"

  def __str__(self):
    return f"[{self.pk}] {self.text}"

  def __repr__(self):
    return f"[{self.pk}] ({self.is_correct}) {self.text}"
  
class MCAOption(models.Model):
  question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='mca_options', db_index=True)
  text = models.CharField(max_length=255)
  is_correct = models.BooleanField(default=False)

  class Meta:
    verbose_name = "MCA Option"
    verbose_name_plural = "MCA Options"

  def __str__(self):
    return f"[{self.pk}] {self.text}"
  
  def __repr__(self):
    return f"[{self.pk}] ({self.is_correct}) {self.text}"

class DnDOption(models.Model):
  question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='dnd_options', db_index=True)
  text = models.CharField(max_length=255)
  correct_position = models.IntegerField()

  class Meta:
    verbose_name = "DnD Option"
    verbose_name_plural = "DnD Options"

  def __str__(self):
    return f"[{self.pk}] {self.text}"

  def __repr__(self):
    return f"[{self.pk}] ({self.correct_position}) {self.text}"

# This is probably not needed
# Will be changed when language model is figured out
""" class TextAnswer(models.Model):
  question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='text_answers')

  class Meta:
    verbose_name = "Text Answer"
    verbose_name_plural = "Text Answers"

  def __str__(self):
    return self.question

  def __repr__(self):
    return f"[{self.pk}] {self.question}" """

class ASGOption(models.Model):
  question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='asg_options', db_index=True)
  text = models.CharField(max_length=255)

  class Meta:
    verbose_name = "ASG Option"
    verbose_name_plural = "ASG Options"

  def __str__(self):
    return f"[{self.pk}] {self.text}"

  def __repr__(self):
    return f"[{self.pk}] {self.text}"

class ASGQuestion(models.Model):
  question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='asg_questions', db_index=True)
  text = models.CharField(max_length=255)
  correct_option = models.ForeignKey(ASGOption, on_delete=models.CASCADE, db_index=True)

  class Meta:
    verbose_name = "ASG Question"
    verbose_name_plural = "ASG Questions"

  def __str__(self):
    return f"[{self.pk}] {self.text}"

  def __repr__(self):
    return f"[{self.pk}] ({self.correct_option}) {self.text}"

class Grade(models.Model):
  text = models.CharField(max_length=255)
  point = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(150)])

  class Meta:
    verbose_name = "SCL Grade"
    verbose_name_plural = "SCL Grades"

  def __str__(self):
    return f"[{self.pk}] ({self.point}) {self.text}"

  def __repr__(self):
    return f"[{self.pk}] ({self.point}) {self.text}"

class GradeType(models.Model):
  name = models.CharField(max_length=255)
  grades = models.ManyToManyField(Grade, related_name='grade_types', db_index=True)

  class Meta:
    verbose_name = "SCL GradeType"
    verbose_name_plural = "SCL GradeTypes"

  def __str__(self):
    return f"[{self.pk}] {self.name}"

  def __repr__(self):
    return f"[{self.pk}] {self.name}"

class SCLOption(models.Model):
  question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='scl_options', db_index=True)
  grade_type = models.ForeignKey(GradeType, on_delete=models.PROTECT, related_name='scl_options', db_index=True)

  class Meta:
    verbose_name = "SCL Option"
    verbose_name_plural = "SCL Options"

  def __str__(self):
    return f"[{self.pk}] (GT: {self.grade_type.pk}) (Q: {self.question.pk}) {self.question.text}"
  
  def __repr__(self):
    return f"[{self.pk}] (GT: {self.grade_type.pk}) (Q: {self.question.pk}) {self.question.text}"

class Rating(models.Model):
  title = models.CharField(max_length=255)
  description = models.TextField()
  sub_topic = models.ForeignKey(SubTopic, on_delete=models.CASCADE, related_name='ratings', db_index=True)
  type = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(3)])

  class Meta:
    verbose_name = "Rating"
    verbose_name_plural = "Ratings"

  def __str__(self):
    return f"[{self.pk}] (ST:{self.sub_topic} - {self.type}) {self.title}"

  def __repr__(self):
    return f"[{self.pk}] (ST:{self.sub_topic} - {self.type}) {self.title}"

class SurveyResult(models.Model):
  sub_topic = models.ForeignKey(SubTopic, on_delete=models.CASCADE, related_name='survey_results', db_index=True)
  rating = models.ForeignKey(Rating, on_delete=models.CASCADE, related_name='survey_results')
  total_points = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(1000)])
  actual_points = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1000)])

  class Meta:
    verbose_name = "Survey result"
    verbose_name_plural = "Survey results"

  def __str__(self):
    return f"[{self.pk}] (T:{self.sub_topic.topic.id}) (ST:{self.sub_topic.pk}) (R: {self.rating.type}) {self.total_points}/{round(self.actual_points)}"

  def __repr__(self):
    return f"[{self.pk}] (T:{self.sub_topic.topic.id}) (ST:{self.sub_topic.pk}) (R: {self.rating.type}) {self.total_points}/{round(self.actual_points)}"

class SurveyAttempt(models.Model):
  user = models.ForeignKey(User, on_delete=models.PROTECT, null=True, related_name='survey_attempts')
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(null=True, blank=True)
  completed = models.BooleanField(default=False)
  language = models.CharField(max_length=255, blank=True)
  topic = models.ForeignKey(Topic, on_delete=models.PROTECT, related_name='survey_attempts')
  questions = models.ManyToManyField(Question, related_name='survey_attempts', db_index=True)
  survey_result = models.ManyToManyField(SurveyResult, related_name='survey_attempts')

  class Meta:
    verbose_name = "Survey Attempt"
    verbose_name_plural = "Survey Attempts"

  def __str__(self):
    return f"[{self.pk}] {self.user.email if self.user else 'Anonymous'} completed {self.completed} on {self.created_at.strftime('%Y-%m-%d %H:%M')}"
  
  def __repr__(self):
    return f"[{self.pk}] completed {self.completed} by {self.user.email}"
  
  def total_questions(self):
    return (self.oca_answers.count() +
      self.mca_answers.count() +
      self.dnd_answers.count() +
      self.text_answers.count() +
      self.scl_answers.count() +
      self.asg_answers.count())

  def answered_questions(self):
    oca_count = self.oca_answers.exclude(answer__isnull=True).count()
    mca_count = self.mca_answers.exclude(answer=None).count()
    dnd_count = self.dnd_answers.exclude(Q(answer__isnull=True) | Q(answer__len=0)).count()
    text_count = self.text_answers.exclude(answer="").exclude(answer__isnull=True).count()
    scl_count = self.scl_answers.exclude(answer__isnull=True).count()
    asg_count = ASGAnswer.objects.filter(survey_attempt=self,).annotate(
    min_option_id=Min('answer__option__id')).filter(min_option_id__gt=0).count()
    
    return oca_count + mca_count + dnd_count + text_count + scl_count + asg_count

  def answer_percentage(self):
    total = self.total_questions()
    if total == 0:
      return 0
    answered = self.answered_questions()
    return round((answered / total) * 100, 2)

# Models of the answers
class OCAAnswer(models.Model):
  survey_attempt = models.ForeignKey(SurveyAttempt, on_delete=models.CASCADE, related_name='oca_answers', db_index=True)
  question = models.ForeignKey(Question, on_delete=models.CASCADE, db_index=True)
  answer = models.ForeignKey(OCAOption, on_delete=models.CASCADE, null=True)
  started_at = models.DateTimeField(blank=True, null=True)
  updated_at = ArrayField(models.DateTimeField(), blank=True, null=True)
  number_of_changes = models.IntegerField(default=0)

  class Meta:
    verbose_name = "OCA Answer"
    verbose_name_plural = "OCA Answers"

  def __str__(self):
    return f"[{self.pk}] Answer to {self.question} by {self.survey_attempt.user.email if self.survey_attempt.user else 'Anonymous'} on attempt {self.survey_attempt.pk}"
  
  def __repr__(self):
    return f"[{self.pk}] {self.answer}"
  
  def save(self, *args, **kwargs):
    if self.pk:
      self.number_of_changes = len(self.updated_at)
    super().save(*args, **kwargs)

class MCAAnswer(models.Model):
  survey_attempt = models.ForeignKey(SurveyAttempt, on_delete=models.CASCADE, related_name='mca_answers', db_index=True)
  question = models.ForeignKey(Question, on_delete=models.CASCADE, db_index=True)
  answer = models.ManyToManyField(MCAOption, related_name='selected_by')
  started_at = models.DateTimeField(blank=True, null=True)
  updated_at = ArrayField(models.DateTimeField(), blank=True, null=True)
  number_of_changes = models.IntegerField(default=0)

  class Meta:
    verbose_name = "MCA Answer"
    verbose_name_plural = "MCA Answers"

  def __str__(self):
    return f"[{self.pk}] MCA Answer to {self.question} by {self.survey_attempt.user.email if self.survey_attempt.user else 'Anonymous'} on attempt {self.survey_attempt.pk}"

  def __repr__(self):
    return f"[{self.pk}] {self.question}"

  def save(self, *args, **kwargs):
    if self.pk:
      self.number_of_changes = len(self.updated_at)
    super().save(*args, **kwargs)

class DnDAnswer(models.Model):
  survey_attempt = models.ForeignKey(SurveyAttempt, on_delete=models.CASCADE, related_name='dnd_answers', db_index=True)
  question = models.ForeignKey(Question, on_delete=models.CASCADE, db_index=True)
  answer = ArrayField(models.IntegerField(), blank=True, null=True)
  started_at = models.DateTimeField(blank=True, null=True)
  updated_at = ArrayField(models.DateTimeField(), blank=True, null=True)
  number_of_changes = models.IntegerField(default=0)

  class Meta:
    verbose_name = "DnD Answer"
    verbose_name_plural = "DnD Answers"

  def __str__(self):
    return f"[{self.pk}] DnD Answer to {self.question} by {self.survey_attempt.user.email if self.survey_attempt.user else 'Anonymous'} on attempt {self.survey_attempt.pk}"
  
  def __repr__(self):
    return f"[{self.pk}] {self.answer}"

  def save(self, *args, **kwargs):
    if self.pk:
      self.number_of_changes = len(self.updated_at)
    super().save(*args, **kwargs)

class TextAnswer(models.Model):
  survey_attempt = models.ForeignKey(SurveyAttempt, on_delete=models.CASCADE, related_name='text_answers', db_index=True)
  question = models.ForeignKey(Question, on_delete=models.CASCADE, db_index=True)
  answer = models.TextField(blank=True, null=True) # noqa: DJ001
  correct = models.BooleanField(default=False)
  started_at = models.DateTimeField(blank=True, null=True)
  updated_at = ArrayField(models.DateTimeField(), blank=True, null=True)
  number_of_changes = models.IntegerField(default=0)
  pasted = models.BooleanField(default=False)

  class Meta:
    verbose_name = "Text Answer"
    verbose_name_plural = "Text Answers"

  def __str__(self):
    return f"[{self.pk}] Answer to {self.question} by {self.survey_attempt.user.email if self.survey_attempt.user else 'Anonymous'} on attempt {self.survey_attempt.pk}"

  def __repr__(self):
    return f"[{self.pk}] {self.answer}"

  def save(self, *args, **kwargs):
    if self.pk:
      self.number_of_changes = len(self.updated_at)
    super().save(*args, **kwargs)

class SCLAnswer(models.Model):
  survey_attempt = models.ForeignKey(SurveyAttempt, on_delete=models.CASCADE, related_name='scl_answers', db_index=True)
  question = models.ForeignKey(Question, on_delete=models.CASCADE, db_index=True)
  answer = models.ForeignKey(Grade, on_delete=models.PROTECT, null=True)
  started_at = models.DateTimeField(blank=True, null=True)
  updated_at = ArrayField(models.DateTimeField(), blank=True, null=True)
  number_of_changes = models.IntegerField(default=0)

  class Meta:
    verbose_name = "Scale Answer"
    verbose_name_plural = "Scale Answers"

  def __str__(self):
    return f"[{self.pk}] Answer to {self.question} by {self.survey_attempt.user.email if self.survey_attempt.user else 'Anonymous'} on attempt {self.survey_attempt.pk}"

  def __repr__(self):
    return f"[{self.pk}]"

  def save(self, *args, **kwargs):
    if self.pk:
      self.number_of_changes = len(self.updated_at)
    super().save(*args, **kwargs)

class ASGOneAnswer(models.Model):
  asg_question = models.ForeignKey(ASGQuestion, on_delete=models.CASCADE, db_index=True)
  option = models.ForeignKey(ASGOption, on_delete=models.CASCADE, null=True, db_index=True)

  class Meta:
    verbose_name = "ASG One Answer"
    verbose_name_plural = "ASG One Answers"

  def __str__(self):
    return f"[{self.pk}] [{self.asg_question.id}] {self.option}"
  
  def __repr__(self):
    return f"[{self.pk}] [{self.asg_question.id}] {self.option}"

class ASGAnswer(models.Model):
  survey_attempt = models.ForeignKey(SurveyAttempt, on_delete=models.CASCADE, related_name='asg_answers', db_index=True)
  question = models.ForeignKey(Question, on_delete=models.CASCADE, db_index=True)
  answer = models.ManyToManyField(ASGOneAnswer, related_name='asg_answers')
  started_at = models.DateTimeField(blank=True, null=True)
  updated_at = ArrayField(models.DateTimeField(), blank=True, null=True)
  number_of_changes = models.IntegerField(default=0)

  class Meta:
    verbose_name = "ASG Answer"
    verbose_name_plural = "ASG Answers"

  def __str__(self):
    return f"[{self.pk}] ASG Answer to {self.question} by {self.survey_attempt.user.email if self.survey_attempt.user else 'Anonymous'} on attempt {self.survey_attempt.pk}"
  
  def __repr__(self):
    return f"[{self.pk}] {self.answer}"

  def save(self, *args, **kwargs):
    if self.pk and self.updated_at:
      self.number_of_changes = len(self.updated_at)
    super().save(*args, **kwargs)

class RegistrationCode(models.Model):
  email = models.CharField(max_length=320)
  code = models.CharField(max_length=64)
  used = models.BooleanField(default=False)
  password = models.CharField(max_length=100)
  created_at = models.DateTimeField(auto_now_add=True)
  first_name = models.CharField(max_length=100)
  last_name = models.CharField(max_length=100)
  country = models.CharField(max_length=50)
  residence = models.CharField(max_length=50)
  age = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(150)])
  gender = models.CharField(max_length=50)
  education = models.CharField(max_length=50)
  employment = models.BooleanField()
  job_fields = ArrayField(models.CharField(max_length=100, blank=True))
  unemployed_months = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(1000)], null=True)

  def __str__(self):
    return f"[{self.pk}] ({self.email}) {self.code}"
  
  def __repr__(self):
    return f"[{self.pk}] ({self.email}) {self.code}"
    
class PasswordResetCode(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  code = models.CharField(max_length=64)
  used = models.BooleanField(default=False)
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"[{self.pk}] ({self.user.email}) {self.code}"
  
  def __repr__(self):
    return f"[{self.pk}] ({self.user.email}) {self.code}"

class Image(models.Model):
  question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='images', db_index=True)
  image = models.FileField(upload_to='images')

  def __str__(self):
    return f"[{self.pk}] Q:{self.question.pk}"
  
  def __repr__(self):
    return f"[{self.pk}] Q:{self.question.pk}"