# ESP32 Sensor Data Collector (SCD41)

Код для сбора данных с датчика SCD41 (температура, влажность и CO2) и отправки на сервер.

## Необходимые компоненты

| Компонент | Описание |
|-----------|----------|
| ESP32 WROOM | Микроконтроллер |
| SCD41 | Датчик CO2, температуры и влажности (I2C) |

## Схема подключения (I2C)

```
ESP32          SCD41
------         -----
3.3V (или 5V) → VCC
GND           → GND
GPIO21        → SDA
GPIO22        → SCL
```

> **Примечание:** Если у вашего модуля SCD41 другая распиновка, сверьтесь с документацией производителя. Обычно I2C использует пины SDA и SCL.

## Установка библиотек

В Arduino IDE:
1. **Sketch** → **Include Library** → **Manage Libraries**
2. Найдите и установите:
   - `Sensirion I2C SCD4x` (автор: Sensirion)

## Настройка

1. Откройте `esp32_sensor.ino`
2. Измените настройки WiFi:
   ```cpp
   const char* WIFI_SSID = "YOUR_WIFI_SSID";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   ```
3. Проверьте URL сервера:
   ```cpp
   const char* API_URL = "https://oxide-level.id.lv/api/measurements/receive";
   ```

## Загрузка

1. Выберите плату: **Tools** → **Board** → **ESP32 Dev Module**
2. Выберите порт: **Tools** → **Port** → COM*
3. Нажмите **Upload**

## Важно!

После запуска ESP32 выведет в Serial Monitor свой **MAC адрес**.
Скопируйте его и добавьте в приложение через кнопку "Add Device" в личном кабинете.

## Формат данных

ESP32 отправляет POST запрос:
```json
{
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "temperature": 22.5,
  "humidity": 45.2,
  "co2": 420
}
```
