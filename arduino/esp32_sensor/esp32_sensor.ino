/*
 * ESP32 Sensor Data Collector (SCD41) - Sensirion Library Version
 * 
 * Библиотека: "Sensirion I2C SCD4x" (установить через Library Manager)
 */

#include <Arduino.h>
#include <SensirionI2CScd4x.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

SensirionI2CScd4x scd4x;

// ========================================
// WiFi setting
// ========================================
const char* ssid = "Vl";
const char* password = "12345678";
const char* serverHost = "oxide-level.id.lv";

// ========================================

// I2C pins (ESP32)
const int SDA_PIN = 21;
const int SCL_PIN = 22;

// Blue LEDs CO2 3 levels
const int BLUE[3] = {13, 12, 14};
// Red LEDs Humidity, 3 levels
const int RED[3]  = {27, 25, 32};
// Status LED
const int STATUS_PIN = 4;

// CO2  (ppm)
const int CO2_L1 = 500;
const int CO2_L2 = 800;

// Humidity t (%)
const float HUM_L1 = 35.0;
const float HUM_L2 = 55.0;

bool sensorOk = false;

// for sending data
unsigned long lastSend = 0;
const unsigned long SEND_INTERVAL = 10000;

// Функция для получения MAC-адреса ESP32
String getMacAddress() {
    uint8_t mac[6];
    WiFi.macAddress(mac);
    char macStr[18];
    sprintf(macStr, "%02X:%02X:%02X:%02X:%02X:%02X", 
            mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
    return String(macStr);
}

void setBlueLevel(int lvl) {
  for (int i = 0; i < 3; i++) {
    digitalWrite(BLUE[i], (i < lvl) ? HIGH : LOW);
  }
}

void setRedLevel(int lvl) {
  for (int i = 0; i < 3; i++) {
    digitalWrite(RED[i], (i < lvl) ? HIGH : LOW);
  }
}

int co2ToLevel(int co2) {
  if (co2 < CO2_L1) return 1;
  if (co2 < CO2_L2) return 2;
  return 3;
}

int humToLevel(float hum) {
  if (hum < HUM_L1) return 1;
  if (hum < HUM_L2) return 2;
  return 3;
}

unsigned long blinkMs = 1000, lastBlink = 0;
bool statusOn = false;

void setBlinkByCO2(int co2) {
  if (co2 < CO2_L1)      blinkMs = 1000;
  else if (co2 < CO2_L2) blinkMs = 500;
  else                   blinkMs = 250;
}

void tickBlink() {
  unsigned long now = millis();
  if (now - lastBlink >= blinkMs) {
    lastBlink = now;
    statusOn = !statusOn;
    digitalWrite(STATUS_PIN, statusOn ? HIGH : LOW);
  }
}

void connectWiFi() {
  Serial.println("=================================");
  Serial.print("Connecting to  WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi is connected!");
    Serial.print("IP adres ESP32: ");
    Serial.println(WiFi.localIP());
    
    // ВЫВОД MAC-АДРЕСА
    Serial.println("=================================");
    Serial.print("MAC Address ESP32: ");
    String macAddr = getMacAddress();
    Serial.println(macAddr);
    Serial.println("=================================");
    Serial.println("Скопируйте этот MAC-адрес и используйте его при добавлении устройства!");
    Serial.println("=================================");
  } else {
    Serial.println("\nWe cant connect to WiFi");
  }
}

void sendDataToServer(int co2, float temp, float humidity) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not avaliable!");
    return;
  }
  
  float oxygen = 20.9 - (co2 - 400) * 0.001;
  if (oxygen < 19.0) oxygen = 19.0;
  if (oxygen > 21.0) oxygen = 21.0;
  
  float particles = humidity * 0.3;
  
  // Получаем MAC-адрес для отправки на сервер
  String macAddr = getMacAddress();
  
  String jsonData = "{";
  jsonData += "\"mac_address\":\"" + macAddr + "\",";
  jsonData += "\"oxygen\":" + String(oxygen, 2) + ",";
  jsonData += "\"co2\":" + String(co2) + ",";
  jsonData += "\"particles\":" + String(particles, 1);
  if (temp > -100) { // Simple check if temp is valid
    jsonData += ",\"temperature\":" + String(temp, 1);
  }
  if (humidity > 0) {
    jsonData += ",\"humidity\":" + String(humidity, 1);
  }
  jsonData += "}";
  
  Serial.println("\nSend Data to back:");
  Serial.print("MAC Address: "); Serial.println(macAddr);
  Serial.print("Oxygen: "); Serial.print(oxygen, 2); Serial.println(" %");
  Serial.print("CO2: "); Serial.print(co2); Serial.println(" ppm");
  Serial.print("Particles: "); Serial.print(particles, 1); Serial.println(" ug/m3");
  Serial.print("Temperature: "); Serial.print(temp, 1); Serial.println(" C");
  Serial.print("Humidity: "); Serial.print(humidity, 1); Serial.println(" %");
  Serial.println("JSON: " + jsonData);
  
  WiFiClientSecure client;
  client.setInsecure();
  
  HTTPClient http;
  String url = "https://" + String(serverHost) + "/api/measurements/receive";
  
  Serial.print("URL: ");
  Serial.println(url);
  
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(jsonData);
  
  if (httpCode > 0) {
    Serial.print("HTTP Response Code: ");
    Serial.println(httpCode);
    
    if (httpCode == 200 || httpCode == 201) {
      Serial.println("Data is sent!");
      String response = http.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.println("Backend give back an error");
      String response = http.getString();
      Serial.println("Response: " + response);
    }
  } else {
    Serial.print("error HTTP: ");
    Serial.println(http.errorToString(httpCode));
  }
  
  http.end();
  Serial.println("----------------------------");
}

void printUint16Hex(uint16_t value) {
  Serial.print(value < 4096 ? "0" : "");
  Serial.print(value < 256 ? "0" : "");
  Serial.print(value < 16 ? "0" : "");
  Serial.print(value, HEX);
}

void printSerialNumber(uint16_t serial0, uint16_t serial1, uint16_t serial2) {
  Serial.print("Serial: 0x");
  printUint16Hex(serial0);
  printUint16Hex(serial1);
  printUint16Hex(serial2);
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("===== SCD41 Monitor (Sensirion Lib) =====");

  // Init LEDs
  for (int i = 0; i < 3; i++) {
    pinMode(BLUE[i], OUTPUT);
    digitalWrite(BLUE[i], LOW);
    pinMode(RED[i], OUTPUT);
    digitalWrite(RED[i], LOW);
  }
  pinMode(STATUS_PIN, OUTPUT);
  digitalWrite(STATUS_PIN, LOW);

  // LED Test
  Serial.println("LED test...");
  for (int i = 0; i < 3; i++) {
    digitalWrite(BLUE[i], HIGH);
    digitalWrite(RED[i], HIGH);
  }
  digitalWrite(STATUS_PIN, HIGH);
  delay(800);
  for (int i = 0; i < 3; i++) {
    digitalWrite(BLUE[i], LOW);
    digitalWrite(RED[i], LOW);
  }
  digitalWrite(STATUS_PIN, LOW);
  delay(200);

  connectWiFi();

  // Init I2C
  Wire.begin(SDA_PIN, SCL_PIN);
  
  // Init SCD4x
  scd4x.begin(Wire);

  // Reset SCD4x to be safe
  // scd4x.stopPeriodicMeasurement(); 
  // delay(500);

  uint16_t error;
  char errorMessage[256];

  // stop potentially ongoing measurement
  error = scd4x.stopPeriodicMeasurement();
  if (error) {
      Serial.print("Error stopping measurement: ");
      errorToString(error, errorMessage, 256);
      Serial.println(errorMessage);
  }

  uint16_t serial0;
  uint16_t serial1;
  uint16_t serial2;
  error = scd4x.getSerialNumber(serial0, serial1, serial2);
  if (error) {
      Serial.print("Error trying to execute getSerialNumber(): ");
      errorToString(error, errorMessage, 256);
      Serial.println(errorMessage);
      sensorOk = false;
      Serial.println("Sensor is not available, we use simulation!");
  } else {
      printSerialNumber(serial0, serial1, serial2);
      Serial.println("Sensor found!");
      sensorOk = true;
      
      // Start Measurement
      error = scd4x.startPeriodicMeasurement();
      if (error) {
          Serial.print("Error trying to execute startPeriodicMeasurement(): ");
          errorToString(error, errorMessage, 256);
          Serial.println(errorMessage);
      }
      Serial.println("Waiting for first measurement... (5 sec)");
  }

  Serial.println();
  Serial.println("CO2(ppm) | Temp(C) | Hum(%) | Blue | Red");
  Serial.println("---------|---------|--------|------|----");
}

void loop() {
  if (!sensorOk) {
    Serial.println("Sensor is not avaliable we use simulation!");
    
    int co2 = 400 + random(-50, 200);
    float temp = 22.0 + random(-20, 20) / 10.0;
    float humidity = 45.0 + random(-100, 100) / 10.0;
    
    Serial.println(" simulation data:");
    Serial.print("CO2: "); Serial.print(co2); Serial.println(" ppm");
    Serial.print("Temp: "); Serial.print(temp, 1); Serial.println(" C");
    Serial.print("Humidity: "); Serial.print(humidity, 1); Serial.println(" %");
    
    int blueLvl = co2ToLevel(co2);
    int redLvl = humToLevel(humidity);
    setBlueLevel(blueLvl);
    setRedLevel(redLvl);
    setBlinkByCO2(co2);
    
    sendDataToServer(co2, temp, humidity);
    
    tickBlink();
    delay(10000); // 10 sec for simulation
    return;
  }

  // Read Measurement
  uint16_t error;
  char errorMessage[256];
  
  // Check data ready status
  bool isDataReady = false;
  error = scd4x.getDataReadyFlag(isDataReady);
  
  if (error) {
    Serial.print("Error trying to execute getDataReadyFlag(): ");
    errorToString(error, errorMessage, 256);
    Serial.println(errorMessage);
    delay(1000);
    return;
  }
  
  if (isDataReady) {
      uint16_t co2Raw;
      float temperature;
      float humidity;
      
      error = scd4x.readMeasurement(co2Raw, temperature, humidity);
      
      if (error) {
          Serial.print("Error trying to execute readMeasurement(): ");
          errorToString(error, errorMessage, 256);
          Serial.println(errorMessage);
      } else if (co2Raw == 0) {
          Serial.println("Invalid sample: CO2 is 0");
      } else {
          int co2 = (int)co2Raw;
          
          int blueLvl = co2ToLevel(co2);
          int redLvl  = humToLevel(humidity);

          setBlueLevel(blueLvl);
          setRedLevel(redLvl);
          setBlinkByCO2(co2);

          Serial.print(co2);
          Serial.print("     | ");
          Serial.print(temperature, 1);
          Serial.print("   | ");
          Serial.print(humidity, 1);
          Serial.print("  | ");
          Serial.print(blueLvl);
          Serial.print("    | ");
          Serial.println(redLvl);
          
          unsigned long now = millis();
          if (now - lastSend >= SEND_INTERVAL) {
            lastSend = now;
            sendDataToServer(co2, temperature, humidity);
          }
      }
  } else {
    // Data not ready yet
  }

  tickBlink();
  delay(100); 
}
