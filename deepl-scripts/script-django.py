import re
import requests

po_content = """
msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\n"
"Content-Transfer-Encoding: 8bit\n"
"Language: en\n"

msgid "Activation link"
msgstr "Activation link"

msgid "User"
msgstr "User"

msgid "here is your password reset link for the IntegrAGE platform, after clicking on the link you can change your password."
msgstr "here is your password reset link for the IntegrAGE platform, after clicking on the link you can change your password."

msgid "Password reset link"
msgstr "Password reset link"

msgid "If the link cannot be opened, copy the following address into your browser:"
msgstr "If the link cannot be opened, copy the following address into your browser:"

msgid "This email was generated automatically, please do not reply to it. If you did not request this email, please ignore it."
msgstr "This email was generated automatically, please do not reply to it. If you did not request this email, please ignore it."

msgid "Best regards,"
msgstr "Best regards,"

msgid "The IntegrAGE Team"
msgstr "The IntegrAGE Team"

msgid "here is your registration link for the IntegrAGE platform, after clicking the link your account will be activated."
msgstr "here is your registration link for the IntegrAGE platform, after clicking the link your account will be activated."
"""

def translate_text(text):
	api = "google"
	source_lang = "en"
	target_lang = "sr"

	if not text:
		return ""

	if api == "google":
		api_url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl={source_lang}&tl={target_lang}&dt=t&q={text}"
		response = requests.get(api_url)
		result = response.json()
		try:
			translation = result[0][0][0]
		except Exception as e:
			print(f"Error: {e}")
			exit(1)
	elif api == "deepl":
		api_url = "https://api-free.deepl.com/v2/translate"
		api_key = ""
		params = {
			"target_lang": target_lang.upper(),
			"auth_key": api_key,
			"text": text,
			"source_lang": source_lang.upper()
		}
		response = requests.post(api_url, data=params)
		result = response.json()
		translation = result['translations'][0]['text']
	else:
		print("Invalid API selected")
		exit(1)
	
	print("Raw API Response:", translation)
	#exit(1)

	if translation:
		return translation
	else:
		error_message = result.get("message", "Unknown error occurred")
		print(f"Error: {error_message}")
		exit(1)

def translate_po_content(content):
    po_entry_pattern = re.compile(r'msgid "(?P<msgid>[^"]*)"\s+msgstr "(?P<msgstr>[^"]*)"')
    
    translated_content = []

    for match in po_entry_pattern.finditer(content):
        msgid = match.group('msgid')
        msgstr = match.group('msgstr')

        if not msgstr or msgstr == msgid:
            translated_msgstr = translate_text(msgid)
        else:
            translated_msgstr = msgstr

        translated_entry = f'msgid "{msgid}"\nmsgstr "{translated_msgstr}"\n'
        translated_content.append(translated_entry)

    return '\n'.join(translated_content)

translated_po_content = translate_po_content(po_content)

print(translated_po_content)

with open("C:/Users/Pisek/Desktop/integrAGE/deepl-scripts/translated-django.txt", 'w', encoding='utf-8') as f:
    f.write(translated_po_content)
