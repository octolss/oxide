import urllib.request
import json

url = "http://localhost:8000/api/auth/register"
data = {
    "email": "debug@test.com",
    "username": "debuguser",
    "password": "debug123"
}

print(f"Sending request to {url}")
print(f"Data: {json.dumps(data, indent=2)}")

try:
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    with urllib.request.urlopen(req) as response:
        status_code = response.status
        body = response.read().decode('utf-8')
        print(f"\nStatus Code: {status_code}")
        print(f"Response Body: {body}")
except urllib.error.HTTPError as e:
    print(f"\nHTTP Error {e.code}")
    print(f"Response: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
