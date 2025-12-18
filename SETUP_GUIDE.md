# 🚀 Полное руководство по установке и запуску

## ✅ Текущий статус

### Запущенные сервисы:

1. **Backend (FastAPI)** 
   - ✅ Работает на `http://localhost:8000`
   - ✅ API документация: `http://localhost:8000/docs`
   - ✅ Подключен к Supabase PostgreSQL

2. **Frontend (React + Vite)**
   - ✅ Работает на `http://localhost:3001`
   - ✅ Использует axios для API запросов
   - ✅ Zustand для state management

## 📝 Что было сделано

### 1. Backend FastAPI с MVC архитектурой

**Структура:**
- `app/controllers/` - Контроллеры (бизнес-логика)
- `app/models/` - Pydantic модели (валидация)
- `app/services/` - Сервисы (auth, password hashing)
- `app/routers/` - API роуты
- `app/database.py` - SQLAlchemy модели
- `app/config.py` - Конфигурация

**Функционал:**
- ✅ Регистрация пользователей с валидацией
- ✅ Вход с JWT токенами
- ✅ Хеширование паролей (bcrypt)
- ✅ Управление устройствами (добавление/удаление)
- ✅ Получение данных измерений
- ✅ Эндпоинт для ESP32 (без авторизации)

**Эндпоинты:**
```
POST   /api/auth/register         - Регистрация
POST   /api/auth/login            - Вход
GET    /api/auth/me               - Текущий пользователь
GET    /api/devices               - Список устройств
POST   /api/devices               - Добавить устройство
DELETE /api/devices/{mac}         - Удалить устройство
GET    /api/measurements/device/{mac} - Получить измерения
POST   /api/measurements/receive  - Получить данные от ESP32
```

### 2. Frontend React с интеграцией API

**Изменения:**
- ✅ Создан `services/api.js` с axios клиентом
- ✅ Обновлен `store/authStore.js` для работы с бэкендом
- ✅ Обновлен `store/deviceStore.js` для работы с бэкендом
- ✅ Обновлен `store/measurementStore.js` для работы с бэкендом
- ✅ Все компоненты адаптированы под новый API
- ✅ JWT токен сохраняется в localStorage
- ✅ Автоматическое добавление токена к запросам
- ✅ Обработка ошибок авторизации (401)

### 3. База данных Supabase PostgreSQL

**Таблицы (согласно 3NF):**
1. `users` - Пользователи (user_id, email, username, password_hash)
2. `device_info` - Устройства (device_id=MAC, device_name)
3. `device_users` - Связь пользователей и устройств
4. `measurements` - Измерения датчиков

## 🔧 Как использовать

### Регистрация нового пользователя

1. Откройте `http://localhost:3001/register`
2. Введите email, username, password
3. После регистрации вы будете автоматически залогинены

### Добавление устройства

1. В дашборде нажмите "Pievienot ierīci"
2. Введите MAC адрес (формат: XX:XX:XX:XX:XX:XX)
3. Опционально - введите название
4. Устройство появится в списке

### Просмотр данных датчика

1. Кликните на устройство в списке
2. Откроется страница с графиками
3. Данные обновляются каждые 10 секунд

### Отправка данных с ESP32

Используйте эндпоинт `/api/measurements/receive`:

```cpp
// Пример кода для ESP32
String serverUrl = "http://your-server:8000/api/measurements/receive";
HTTPClient http;
http.begin(serverUrl);
http.addHeader("Content-Type", "application/json");

String payload = "{";
payload += "\"device_id\":\"" + macAddress + "\",";
payload += "\"temperature\":" + String(temperature) + ",";
payload += "\"humidity\":" + String(humidity) + ",";
payload += "\"co2\":" + String(co2);
payload += "}";

int httpCode = http.POST(payload);
http.end();
```

## 🔑 Настройка для продакшена

### Backend

1. Измените `SECRET_KEY` в `backend/app/config.py`:
```python
secret_key: str = "ВСТАВЬТЕ-СЛУЧАЙНУЮ-СТРОКУ-МИНИМУМ-32-СИМВОЛА"
```

Сгенерировать можно так:
```python
import secrets
print(secrets.token_urlsafe(32))
```

2. Настройте CORS для вашего домена в `backend/app/main.py`:
```python
allow_origins=["https://your-domain.com"]
```

### Frontend

1. Измените API URL в `frontend/src/services/api.js`:
```javascript
const API_URL = 'https://your-api-domain.com/api'
```

2. Соберите продакшен билд:
```bash
cd frontend
npm run build
```

## 📊 Проверка работы API

### Через Swagger UI

Откройте `http://localhost:8000/docs` и протестируйте эндпоинты:

1. **Регистрация:**
   - Эндпоинт: `POST /api/auth/register`
   - Body:
     ```json
     {
       "email": "test@test.com",
       "username": "testuser",
       "password": "testpass123"
     }
     ```

2. **Вход:**
   - Эндпоинт: `POST /api/auth/login`
   - Body:
     ```json
     {
       "email": "test@test.com",
       "password": "testpass123"
     }
     ```
   - Скопируйте `access_token` из ответа

3. **Авторизуйтесь в Swagger:**
   - Нажмите кнопку "Authorize" вверху справа
   - Вставьте токен
   - Нажмите "Authorize"

4. **Добавьте устройство:**
   - Эндпоинт: `POST /api/devices`
   - Body:
     ```json
     {
       "mac_address": "AA:BB:CC:DD:EE:FF",
       "device_name": "Test Device"
     }
     ```

5. **Отправьте тестовые данные:**
   - Эндпоинт: `POST /api/measurements/receive`
   - Body:
     ```json
     {
       "device_id": "AA:BB:CC:DD:EE:FF",
       "temperature": 22.5,
       "humidity": 65.3,
       "co2": 450.0
     }
     ```

6. **Получите измерения:**
   - Эндпоинт: `GET /api/measurements/device/AA:BB:CC:DD:EE:FF?limit=100`

## 🐛 Решение проблем

### Backend не запускается

```bash
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend показывает ошибки

1. Проверьте, что backend запущен
2. Проверьте консоль браузера (F12)
3. Убедитесь, что axios установлен:
   ```bash
   cd frontend
   npm install axios
   npm run dev
   ```

### Ошибка подключения к БД

1. Проверьте `backend/app/config.py`
2. Убедитесь, что DATABASE_URL правильный
3. Проверьте, что таблицы созданы в Supabase

### 401 Unauthorized

1. Перезалогиньтесь
2. Проверьте, что токен сохранён в localStorage
3. Проверьте срок действия токена (30 минут)

## 📱 Запуск в продакшене

### Backend (uvicorn)

```bash
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Или с несколькими воркерами:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend (nginx)

1. Соберите билд:
```bash
cd frontend
npm run build
```

2. Настройте nginx для обслуживания `dist/` директории

## 🎉 Готово!

Система полностью настроена и работает. Можете:
- Регистрироваться и входить
- Добавлять устройства
- Просматривать данные датчиков
- Отправлять данные с ESP32

Если есть вопросы - смотрите API документацию на `http://localhost:8000/docs`

## ☁️ Cloudflare Deployment Guide

To enable the automated frontend deployment and backend tunnel, follow these steps:

### 1. Cloudflare Setup for Frontend

1.  **Create a Cloudflare Account** if you haven't already.
2.  **Create a Pages Project**:
    *   Go to **Workers & Pages** > **Overview**.
    *   Click **Create application**.
    *   Select **Pages**.
    *   Select **Upload assets** (Direct Upload).
    *   Name the project `iot-frontend` (must match the `projectName` in `.github/workflows/deploy-frontend.yml`).
    *   Click **Create project**.

3.  **Get Account ID**:
    *   In the **Workers & Pages** overview, find your **Account ID** in the right sidebar.
    *   Copy this value.

4.  **Generate API Token**:
    *   Go to **My Profile** > **API Tokens**.
    *   Click **Create Token**.
    *   Use the **Edit Cloudflare Workers** template (or create a Custom Token).
    *   Ensure permissions include **Account > Cloudflare Pages > Edit**.
    *   Copy the generated token.

### 2. GitHub Secrets

Add the following secrets to your GitHub repository (**Settings** > **Secrets and variables** > **Actions** > **New repository secret**):

*   `CLOUDFLARE_API_TOKEN`: Your generated API Token.
*   `CLOUDFLARE_ACCOUNT_ID`: Your Account ID.
*   `DATABASE_URL`: Connection string for Supabase.
*   `JWT_SECRET`: Your secret key.
*   `IOT_TOKEN`: Token for devices (if used).

### 3. Usage

*   **Frontend**: Push changes to the `frontend` folder. The "Deploy Frontend" workflow will run automatically and deploy to `https://iot-frontend.pages.dev` (or your custom domain).
*   **Backend**: Go to the **Actions** tab in GitHub, select **Backend Tunnel**, and click **Run workflow**. 
    *   Wait for the "Start Tunnel" step.
    *   Open the step logs to find the temporal URL (e.g., `https://random-name.trycloudflare.com`).
    *   **Note**: This URL changes every time. You will need to update your frontend configuration or use a persistent Cloudflare Tunnel (requires domain setup) for a fixed URL.


