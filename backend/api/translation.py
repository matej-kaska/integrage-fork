from modeltranslation.translator import register, TranslationOptions
from .models import ASGQuestion, Grade, Question, OCAOption, MCAOption, DnDOption, SubTopic, Topic, ASGOption, Image, Rating

@register(Question)
class QuestionTranslationOptions(TranslationOptions):
  fields = ('text',)

@register(OCAOption)
class OCAOptionTranslationOptions(TranslationOptions):
  fields = ('text',)

@register(MCAOption)
class MCAOptionTranslationOptions(TranslationOptions):
  fields = ('text',)

@register(DnDOption)
class DnDOptionTranslationOptions(TranslationOptions):
  fields = ('text',)

@register(ASGOption)
class ASGOptionTranslationOptions(TranslationOptions):
  fields = ('text',)

@register(ASGQuestion)
class ASGQuestionTranslationOptions(TranslationOptions):
  fields = ('text',)

@register(Grade)
class GradeTranslationOptions(TranslationOptions):
  fields = ('text',)

@register(Topic)
class TopicTranslationOptions(TranslationOptions):
  fields = ('name','description')

@register(SubTopic)
class SubTopicTranslationOptions(TranslationOptions):
  fields = ('name',)

@register(Image)
class ImageTranslationOptions(TranslationOptions):
  fields = ('image',)

@register(Rating)
class RatingTranslationOptions(TranslationOptions):
  fields = ('title','description')