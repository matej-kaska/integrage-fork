import json
import os

LOCALES_PATH = "locales-frontend"
translations = {}
languages = ["bg", "bs", "cs", "de", "en", "hr", "hu", "sk", "sl", "sr"]

def load_translations():
  global translations
  for lang in languages:
    file_path = os.path.join(LOCALES_PATH, lang, 'translation.json')
    if os.path.exists(file_path):
      with open(file_path, 'r', encoding='utf-8') as f:
        translations[lang] = json.load(f)


def t(key, lang='en'):
  keys = key.split('.')
  if lang not in languages:
    lang = 'en'
  translation = translations.get(lang, {})

  for k in keys:
    translation = translation.get(k, None)
    if translation is None:
      return key

  return translation