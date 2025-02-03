import json
import requests

json_data = {
	"EXPORT": {
		"SELECT_LANGUAGE": "Select language used in export",
		"SELECT_TOPIC": "Select topic",
		"SELECT_COUNTRY": "Select country",
		"SELECT_TIME": "Select time range",
		"FROM": "From",
		"TO": "To",
		"NUMBER_OF_AVAIABLE": "Number of available questionnaires",
		"EXPORT": "Export to CSV",
		"OPTIONAL": "optional"
	},
}

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

def translate_json(data):
	if isinstance(data, dict):
		return {key: translate_json(value) for key, value in data.items()}
	elif isinstance(data, list):
		return [translate_json(item) for item in data]
	elif isinstance(data, str):
		return translate_text(data)
	else:
			return data

translated_json = translate_json(json_data)

print(json.dumps(translated_json, indent=4, ensure_ascii=False))

with open("C:/Users/Pisek/Desktop/integrAGE/deepl-scripts/translated-react.txt", 'w', encoding='utf-8') as f:
  json.dump(translated_json, f, indent=4, ensure_ascii=False)