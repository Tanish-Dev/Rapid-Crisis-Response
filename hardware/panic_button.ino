/*
 * ============================================================
 *  Rapid Crisis Response Platform — IoT Panic Button
 *  Hardware: ESP32 | 4-Button Emergency Panel
 *  Alerts: Medical / Fire / Security / Distress
 *  Communication: WiFi + HTTPS POST to Backend API
 *  Confirmation: LED + Buzzer on press
 * ============================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include "time.h"

// ---------- PIN CONFIGURATION ----------
#define BTN_MEDICAL   15
#define BTN_FIRE      16
#define BTN_SECURITY  17
#define BTN_DISTRESS  18
#define LED_PIN       2
#define BUZZER_PIN    4

// ---------- WIFI CREDENTIALS ----------
const char* ssid     = "HP 0512";
const char* password = "darshan123";

// ---------- BACKEND ----------
const char* backendURL = "https://transform-stretch-handiwork.ngrok-free.dev/api/alert";

// ---------- NTP (UTC) ----------
const char* ntpServer       = "216.239.35.0";
const long  gmtOffset_sec   = 0;
const int   daylightOffset_sec = 0;

// ---------- BUTTON STATE ----------
bool lastState_Medical  = HIGH;
bool lastState_Fire     = HIGH;
bool lastState_Security = HIGH;
bool lastState_Distress = HIGH;

// ============================================================
//  TIME SETUP
// ============================================================
void initTime() {
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.print("[TIME] Syncing with NTP server");
  time_t now = time(nullptr);
  int retry = 0;
  while (now < 100000 && retry < 40) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
    retry++;
  }
  Serial.println(now > 100000 ? "\n[TIME] Sync successful" : "\n[TIME] Sync failed — using fallback");
}

// ============================================================
//  ISO 8601 TIMESTAMP
// ============================================================
String getISOTime() {
  time_t now = time(nullptr);
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  char buffer[30];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buffer);
}

// ============================================================
//  CONFIRMATION FEEDBACK (LED + BUZZER)
// ============================================================
void triggerConfirmation() {
  digitalWrite(LED_PIN, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(300);
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
}

// ============================================================
//  SEND ALERT TO BACKEND
// ============================================================
void sendAlert(String type) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[NETWORK] WiFi disconnected — alert not sent");
    return;
  }

  WiFiClientSecure client;
  client.setInsecure(); // SSL — production should use cert pinning

  HTTPClient http;
  http.begin(client, backendURL);
  http.addHeader("Content-Type", "application/json");

  String payload = "{";
  payload += "\"type\":\""        + type             + "\",";
  payload += "\"room\":\""        + String("Zone A") + "\",";
  payload += "\"device_name\":\"" + String("esp32_panic_button_01") + "\",";
  payload += "\"timestamp\":\""   + getISOTime()     + "\"";
  payload += "}";

  Serial.println("[ALERT] Sending payload:");
  Serial.println(payload);

  int responseCode = -1;
  for (int attempt = 1; attempt <= 3; attempt++) {
    responseCode = http.POST(payload);
    if (responseCode > 0) {
      Serial.printf("[ALERT] Sent successfully — HTTP %d\n", responseCode);
      triggerConfirmation();
      break;
    }
    Serial.printf("[ALERT] Attempt %d failed — retrying...\n", attempt);
    delay(1000);
  }

  if (responseCode <= 0) {
    Serial.println("[ALERT] All attempts failed — check backend connectivity");
  }

  http.end();
}

// ============================================================
//  SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n[BOOT] Rapid Crisis Response — Panic Button Initializing...");

  // Button pins
  pinMode(BTN_MEDICAL,  INPUT_PULLUP);
  pinMode(BTN_FIRE,     INPUT_PULLUP);
  pinMode(BTN_SECURITY, INPUT_PULLUP);
  pinMode(BTN_DISTRESS, INPUT_PULLUP);

  // Output pins
  pinMode(LED_PIN,    OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // WiFi
  Serial.printf("[WIFI] Connecting to %s", ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\n[WIFI] Connected — IP: %s\n", WiFi.localIP().toString().c_str());

  delay(1000);
  initTime();

  Serial.println("[BOOT] System ready — awaiting emergency input\n");
}

// ============================================================
//  MAIN LOOP — BUTTON POLLING
// ============================================================
void loop() {
  bool current_Medical  = digitalRead(BTN_MEDICAL);
  bool current_Fire     = digitalRead(BTN_FIRE);
  bool current_Security = digitalRead(BTN_SECURITY);
  bool current_Distress = digitalRead(BTN_DISTRESS);

  if (lastState_Medical == HIGH && current_Medical == LOW) {
    Serial.println("[INPUT] MEDICAL button pressed");
    sendAlert("medical");
    delay(2000);
  }

  if (lastState_Fire == HIGH && current_Fire == LOW) {
    Serial.println("[INPUT] FIRE button pressed");
    sendAlert("fire");
    delay(2000);
  }

  if (lastState_Security == HIGH && current_Security == LOW) {
    Serial.println("[INPUT] SECURITY button pressed");
    sendAlert("security");
    delay(2000);
  }

  if (lastState_Distress == HIGH && current_Distress == LOW) {
    Serial.println("[INPUT] DISTRESS button pressed");
    sendAlert("distress");
    delay(2000);
  }

  lastState_Medical  = current_Medical;
  lastState_Fire     = current_Fire;
  lastState_Security = current_Security;
  lastState_Distress = current_Distress;

  delay(50);
}
