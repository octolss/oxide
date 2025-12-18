# Sensoru Pārvaldes Sistēma - Backend API

Backend на FastAPI с MVC архитектурой для работы с Supabase PostgreSQL.

## Установка

1. Создайте виртуальное окружение:
```bash
python -m venv venv
```

2. Активируйте виртуальное окружение:
- Windows PowerShell:
```bash
.\venv\Scripts\Activate.ps1
```
- Linux/Mac:
```bash
source venv/bin/activate
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

4. Настройте `.env` файл:
- Скопируйте пароль от вашей БД Supabase (Settings > Database > Connection string)
- Замените `[YOUR_DB_PASSWORD]` на ваш пароль
- Измените `SECRET_KEY` на случайную строку (минимум 32 символа)

## Запуск

```bash
uvicorn app.main:app --reload --port 8000
```

API будет доступен на `http://localhost:8000`

## Документация

После запуска сервера документация доступна по адресам:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Эндпоинты

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

### Устройства
- `POST /api/devices` - Добавить устройство
- `GET /api/devices` - Список устройств
- `DELETE /api/devices/{mac_address}` - Удалить устройство

### Измерения
- `GET /api/measurements/device/{mac_address}` - Получить измерения устройства
- `POST /api/measurements/receive` - Получить данные от ESP32 (без авторизации)

