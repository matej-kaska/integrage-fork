import os
import json
import requests

target_lang = "bs"

def translate_text(text):
	api = "google"
	source_lang = "en"

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

def translate_json_content(json_content, target_lang_json):
    for item in json_content:
        fields = item.get('fields', {})
        for key, value in list(fields.items()):
            if key.endswith('_en'):
                base_key = key[:-3]
                target_key = f"{base_key}_{target_lang_json}"
                if value and (target_key not in fields or fields[target_key] == "" or fields[target_key] is None):
                    translated_text = translate_text(value)
                    fields[target_key] = translated_text


def process_json_files(directory_path, target_lang_json):
    output_directory = os.path.join(directory_path, f"translated_{target_lang_json}")
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    for filename in os.listdir(directory_path):
        if filename.endswith('.json'):
            file_path = os.path.join(directory_path, filename)
            with open(file_path, 'r', encoding='utf-8') as file:
                json_content = json.load(file)
                translate_json_content(json_content, target_lang_json)

            new_file_path = os.path.join(output_directory, filename)

            with open(new_file_path, 'w', encoding='utf-8') as file:
                json.dump(json_content, file, indent=4, ensure_ascii=False)

directory_path = 'C:/Users/Pisek/Desktop/integrage/deepl-scripts/datadumps'

process_json_files(directory_path, target_lang)
