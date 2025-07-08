import json
from datetime import datetime

collection = {
    "info": {
        "name": "LanguageExchange API - Lessons & Quizzes",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        "_postman_id": "language-exchange-" + datetime.now().isoformat()
    },
    "item": [
        {
            "name": "Login (Get Token)",
            "request": {
                "method": "POST",
                "header": [{"key": "Content-Type", "value": "application/json"}],
                "body": {
                    "mode": "raw",
                    "raw": json.dumps({"email": "test@example.com", "password": "yourpassword"}, indent=2)
                },
                "url": {"raw": "{{base_url}}/api/auth/login", "host": ["{{base_url}}"], "path": ["api", "auth", "login"]}
            }
        },
        {
            "name": "Create Lesson",
            "request": {
                "method": "POST",
                "header": [
                    {"key": "Content-Type", "value": "application/json"},
                    {"key": "Authorization", "value": "Bearer {{token}}"}
                ],
                "body": {
                    "mode": "raw",
                    "raw": json.dumps({
                        "title": "Spanish Basics",
                        "content": "Hola means Hello. Gracias means Thank you.",
                        "level": "Beginner"
                    }, indent=2)
                },
                "url": {"raw": "{{base_url}}/api/lessons", "host": ["{{base_url}}"], "path": ["api", "lessons"]}
            }
        },
        {
            "name": "Get All Lessons",
            "request": {
                "method": "GET",
                "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
                "url": {"raw": "{{base_url}}/api/lessons", "host": ["{{base_url}}"], "path": ["api", "lessons"]}
            }
        },
        {
            "name": "Create Quiz",
            "request": {
                "method": "POST",
                "header": [
                    {"key": "Content-Type", "value": "application/json"},
                    {"key": "Authorization", "value": "Bearer {{token}}"}
                ],
                "body": {
                    "mode": "raw",
                    "raw": json.dumps({
                        "lessonId": "{{lessonId}}",
                        "questions": [
                            {
                                "question": "What does 'Hola' mean?",
                                "options": ["Goodbye", "Hello", "Please", "Thanks"],
                                "correctAnswer": "Hello"
                            },
                            {
                                "question": "What does 'Gracias' mean?",
                                "options": ["Sorry", "Thank you", "Yes", "No"],
                                "correctAnswer": "Thank you"
                            }
                        ]
                    }, indent=2)
                },
                "url": {"raw": "{{base_url}}/api/quizzes", "host": ["{{base_url}}"], "path": ["api", "quizzes"]}
            }
        },
        {
            "name": "Submit Quiz",
            "request": {
                "method": "POST",
                "header": [
                    {"key": "Content-Type", "value": "application/json"},
                    {"key": "Authorization", "value": "Bearer {{token}}"}
                ],
                "body": {
                    "mode": "raw",
                    "raw": json.dumps({
                        "quizId": "{{quizId}}",
                        "answers": [
                            {"question": "What does 'Hola' mean?", "answer": "Hello"},
                            {"question": "What does 'Gracias' mean?", "answer": "Thank you"}
                        ]
                    }, indent=2)
                },
                "url": {"raw": "{{base_url}}/api/quizzes/submit", "host": ["{{base_url}}"], "path": ["api", "quizzes", "submit"]}
            }
        },
        {
            "name": "Get Quiz Progress",
            "request": {
                "method": "GET",
                "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
                "url": {"raw": "{{base_url}}/api/quizzes/progress", "host": ["{{base_url}}"], "path": ["api", "quizzes", "progress"]}
            }
        }
    ]
}

with open("languageExchange_lessons_quizzes.postman_collection.json", "w") as f:
    json.dump(collection, f, indent=2)

print("✅ Postman collection exported to languageExchange_lessons_quizzes.postman_collection.json")
