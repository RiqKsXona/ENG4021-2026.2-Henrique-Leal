from django.shortcuts import render
from django.http import JsonResponse
import requests
import json
import os

GEMINI_API_KEY = ""
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

def call_bot(request):
    if request.method != "POST":
        return JsonResponse({"error": "Use o método POST."}, status=405)

    body = json.loads(request.body)
    message = body.get("message", "")

    payload = {
        "system_instruction": {
            "parts": [{"text": "Você é o Cine Assistente da Lumière. Responda em português, de forma curta e simpática, com recomendações e curiosidades sobre filmes."}]
        },
        "contents": [
            {"role": "user", "parts": [{"text": message}]}
        ],
    }
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
    }

    response = requests.post(GEMINI_URL, headers=headers, json=payload)
    if response.status_code != 200:
        return JsonResponse({"error": response.text}, status=502)

    response_json = response.json()
    print(response_json)
    reply = response_json["candidates"][0]["content"]["parts"][0]["text"]

    return JsonResponse({"reply": reply})


def home(request):
    response = requests.get("https://omdbapi.com/?apikey=38b4b85b&s=Batman&y=2022&type=movie")
    response_json = response.json()
    movies = response_json["Search"]
    context = {
        "movies": movies
    }

    return render(request, "index.html", context)

def chat(request):
    return render(request, "chat.html")
