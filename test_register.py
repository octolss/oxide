import requests
import json

# Тестируем регистрацию
url = "http://localhost:8000/api/auth/register"
data = {
    "email": "test@test.com",
    "username": "testuser",
    "password": "testpass123"
}

print(f"Отправляю POST на {url}")
print(f"Данные: {json.dumps(data, indent=2)}")
print()

try:
    response = requests.post(url, json=data, timeout=10)
    print(f"Статус: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print()
    print("Ответ:")
    try:
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    except:
        print(response.text)
except Exception as e:
    print(f"Ошибка: {e}")

