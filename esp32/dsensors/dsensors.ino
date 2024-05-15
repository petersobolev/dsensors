/*

DSensors - simple monitoring/smart home solution (esp32)
by Peter Sobolev (frog) 
https://github.com/petersobolev
frog@enlight.ru

*/

#include "ATC_MiThermometer.h"
#include <ArduinoJson.h>
#include <ZMPT101B.h>
//#include <WiFi.h>
//#include "time.h"
#include <WiFiClientSecure.h>
#include "esp_wifi.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#include "INA219.h"

#include "esp_sleep.h"
#include "dsensors_cfg.h"

unsigned long uptime; // for tasks

int loc = 1;
int src = 1;

int count = 1;  // global loop counter (iterations since reset)
bool firstLoop = true; // true only during first loop() iteration

uint64_t gpio_wakeup = 0; // number of GPIO caused wake up

#define REQUEST_PERIOD_DEFAULT 10; 
int requestPeriod = REQUEST_PERIOD_DEFAULT; //delay between http requests, seconds

// ================================== UPS (Li batteries)====================================

INA219 INA(0x42); // I2C port 0x42

// ================================== RELAYS =======================================

const int relay1Pin = 16;
const int relay2Pin = 17;

#define RELAY_ON 0
#define RELAY_OFF 1

// ================================== SWITCH =======================================

#define RSWITCH_SENSOR 25 // switch at GPIO 25

boolean rswitch = false;

// ================================== MOTION SENSOR =======================================

#define MOTION_SENSOR_1 33 // motion PIR sensor 1 on GPIO 33
#define MOTION_SENSOR_2 26 // motion PIR sensor 2 on GPIO 26

boolean motion_1 = false;
boolean motion_2 = false;

// ================================== ONEWIRE THERMAL SENSORS =================================

#define ONE_WIRE_BUS 32 // several sensors on GPIO 22

OneWire oneWire(ONE_WIRE_BUS);

DallasTemperature thermSensors(&oneWire);

int therm_total_devices;
DeviceAddress therm_sensor_address; 

// ================================== VOLTAGE =================================================

#define SENSITIVITY_1 537.0f //537.25
#define SENSITIVITY_2 537.0f //537.25

// ZMPT101B sensor output connected to analog pin 34 or 35
// and the voltage source frequency is 50 Hz.
ZMPT101B voltageSensor_1(34, 50.0); 
ZMPT101B voltageSensor_2(35, 50.0); 

// ================================== NTP =================================
/*
// get current time. Not used.
const char* ntpServer = "pool.ntp.org";
//const long  gmtOffset_sec = 0;
const long  gmtOffset_sec = 3 * 3600L; // Moscow time zone (+3)
const int   daylightOffset_sec = 3600;
struct tm timeinfo;
time_t t = time(nullptr);
*/
// ================================== WIFI =================================

/*
dsensors_cfg.h:

const char* ssid     = "wifisid"; // Change this to your WiFi SSID
const char* password = "wifipassword"; // Change this to your WiFi password
const char* host = "www.example.ru"; // Change this to your host
const char* path = "/somewhere/there"; // Change this to your path
const int port = 4000; 
*/
// =================================== BLE ====================================

ATC_MiThermometer miThermometer(100,99); //interval, window
const int scanTime = 5; // 	The duration in seconds for which to scan. (passes to start(duration) )

// ================================ WIFI ====================================

void WiFiStationConnected(WiFiEvent_t event, WiFiEventInfo_t info) {
  
  Serial.println("WiFi connected");  
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("MAC address: ");
  Serial.println(WiFi.macAddress());
  Serial.print("RSSI: ");
  Serial.println(WiFi.RSSI());

}

void WiFiGotIP(WiFiEvent_t event, WiFiEventInfo_t info) {

  Serial.println("WiFi connected. IP address: ");
  Serial.println(WiFi.localIP());

}

void WiFiStationDisconnected(WiFiEvent_t event, WiFiEventInfo_t info) {
  Serial.print("WiFi disconnected. Reason: ");
  Serial.println(info.wifi_sta_disconnected.reason); // 2 - WIFI_REASON_AUTH_EXPIRE
//  WiFi.reconnect();
}



// ====================================================================================================
// ================================================ SETUP =============================================
// ====================================================================================================


void setup() {

  Serial.begin(115200);

  // Allocate the JSON document
  JsonDocument doc; // for outbound data
  JsonDocument docIn; // for answer 

  doc.to<JsonArray>();

// ==== setup UPS =======================================

  Wire.begin();
  if (!INA.begin() )
    Serial.println("Could not connect UPS / IMA219 using I2C");

  INA.setMaxCurrentShunt(5, 0.002); // calibration (amperes, ohms). Calibration is mandatory for getCurrent() and getPower() to work.

// ==== setup RELAYS =======================================

  digitalWrite(relay1Pin, HIGH); // to prevent enabling relay on reset (because relays are active low)
  digitalWrite(relay2Pin, HIGH); // to prevent enabling relay on reset (because relays are active low)
  pinMode(relay1Pin, OUTPUT);
  pinMode(relay2Pin, OUTPUT);

// ==== setup SWITCH =======================================

// switch currently unused
//  pinMode(RSWITCH_SENSOR, INPUT);
  pinMode(RSWITCH_SENSOR, INPUT_PULLUP);

// ==== setup MOTION sensor =======================================

  pinMode(MOTION_SENSOR_1, INPUT);
  pinMode(MOTION_SENSOR_2, INPUT);

// ==== setup onewire thermal sensors

  thermSensors.begin();
  
  therm_total_devices = thermSensors.getDeviceCount();
  
  Serial.print("Locating onewire devices...");
  Serial.print("Found ");
  Serial.print(therm_total_devices, DEC);
  Serial.println(" devices.");

  for(int i=0;i<therm_total_devices; i++){

    if (thermSensors.getAddress(therm_sensor_address, i)) {

      Serial.print("Found onewire device ");
      Serial.print(i, DEC);
      Serial.print(" with address: ");

      for (uint8_t i = 0; i < 8; i++) {
        if (therm_sensor_address[i] < 16) Serial.print("0");
          Serial.print(therm_sensor_address[i], HEX);
      }//for

      Serial.println();
    } else {
      Serial.print("Found thermal sensor at ");
      Serial.print(i, DEC);
      Serial.print(" but could not detect address. Check circuit connection!");
    }//else

  }//for


// ==== setup Voltage

  voltageSensor_1.setSensitivity(SENSITIVITY_1);
  voltageSensor_2.setSensitivity(SENSITIVITY_2);

// ==== setup BLE

  miThermometer.begin();

// ==== setup WIFI

  WiFi.onEvent(WiFiStationConnected, WiFiEvent_t::ARDUINO_EVENT_WIFI_STA_CONNECTED);
  WiFi.onEvent(WiFiGotIP, WiFiEvent_t::ARDUINO_EVENT_WIFI_STA_GOT_IP);
  WiFi.onEvent(WiFiStationDisconnected, WiFiEvent_t::ARDUINO_EVENT_WIFI_STA_DISCONNECTED);


/*
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  Serial.print("NTP time synchronizing... ");

  long i = 0;
//  time_t t = time(nullptr);
  while (t < 1000000000) {
    t = time(nullptr);
    i++;
      // do not wait forever
    if (i > 60) {
      Serial.println("");
      Serial.println("Time sync failed!");
      break;
    };
    Serial.print(".");
    delay(500);
  }

  if(!getLocalTime(&timeinfo)){
    Serial.println("Failed to obtain time");
    return;
  } else {
    Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");
  }

  localtime_r(&t, &timeinfo);
  Serial.print("Current time: ");
  Serial.print(asctime(&timeinfo));

*/

}//setup()


// ----------------------------- LOOP ------------------------------------

void loop() {

  uptime = millis (); //uptime

// ==== setup WiFi

  WiFi.disconnect(true);

  delay(1000);


/* Remove WiFi event
  Serial.print("WiFi Event ID: ");
  Serial.println(eventID);
  WiFi.removeEvent(eventID);*/

  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }


  WiFiClientSecure client;

//  t = time(nullptr); 
//  localtime_r(&t, &timeinfo);

// Allocate the JSON document
  JsonDocument doc;
  JsonDocument docIn;
//  JsonObject doc = doc.to<JsonObject>();

  doc["loc"] = loc; // device location
  doc["src"] = src; // place at device location
  doc["count"] = String(count);
  doc["uptime"] = String(uptime);
//  doc["w_time"] = asctime(&timeinfo);
//  doc["w_time_ut"] = String(t);
  doc["w_rssi"] = String(WiFi.RSSI());
  doc["heap"] = String(ESP.getFreeHeap());

// ====================== SCAN UPS ========================

  

  float ups_v = INA.getBusVoltage();
  float ups_sv = INA.getShuntVoltage_mV();
  float ups_c = INA.getCurrent_mA();
  float ups_p = INA.getPower_mW();

  doc["ups_v"] = String(ups_v);
  doc["ups_sv"] = String(ups_sv);
  doc["ups_c"] = String(ups_c);
  doc["ups_p"] = String(ups_p);

  Serial.print("UPS v:");Serial.println(ups_v);
  Serial.print("UPS sv:");Serial.println(ups_sv);
  Serial.print("UPS c:");Serial.println(ups_c);
  Serial.print("UPS p:");Serial.println(ups_p);
  
// ====================== SCAN SWITCH =====================


  if (rswitch) {

    doc["rswitch"].to<JsonArray>();    

    JsonObject rswitch_obj = doc["rswitch"].add<JsonObject>();
    doc["rswitch"].remove(0); // fix to avoid extra element in array
    doc["rswitch"].add(rswitch_obj);
    rswitch_obj["i"] = 1;
    rswitch_obj["s"] = 1;

    Serial.println("SWITCH CHANGE DETECTED");
    rswitch = false;
  }


// ====================== SCAN MOTION SENSOR =====================


  if ( (motion_1) || (motion_2) ) {

    doc["motion"].to<JsonArray>();    

    JsonObject motion_obj = doc["motion"].add<JsonObject>();
    doc["motion"].remove(0); // fix to avoid extra element in array

    if (motion_1) {
      doc["motion"].add(motion_obj);

      motion_obj["i"] = 1;
      motion_obj["m"] = 1;

      Serial.println("MOTION 1 DETECTED");
      motion_1 = false;
    }

    if (motion_2) {
      doc["motion"].add(motion_obj);
      
      motion_obj["i"] = 2;
      motion_obj["m"] = 1;

      Serial.println("MOTION 2 DETECTED");
      motion_2 = false;
    }


  }//if

// ====================== SCAN VOLTAGE ===============================

  doc["v"].to<JsonArray>();    

  JsonObject v_obj = doc["v"].add<JsonObject>();
  doc["v"].remove(0); // fix to avoid extra element in array

  float voltage_1 = voltageSensor_1.getRmsVoltage();
  float voltage_2 = voltageSensor_2.getRmsVoltage();
  Serial.print("Voltage 1: "); Serial.println(voltage_1);
  Serial.print("Voltage 2: "); Serial.println(voltage_2);


  doc["v"].add(v_obj);
  v_obj["i"] = 1;
  v_obj["v"] = String(voltage_1);
  
  doc["v"].add(v_obj);
  v_obj["i"] = 2;
  v_obj["v"] = String(voltage_2);


// ====================== SCAN ONEWIRE THERMAL SENSORS ===============================

  doc["ot"].to<JsonArray>();    

  JsonObject ot_obj = doc["ot"].add<JsonObject>();
  doc["ot"].remove(0); // fix to avoid extra element in array

  thermSensors.requestTemperatures(); 
  
  for(int i=0;i<therm_total_devices; i++){
    
    if(thermSensors.getAddress(therm_sensor_address, i)){
      
      Serial.print("Temperature for onewire device: "); Serial.print(i,DEC); Serial.print(" - "); Serial.print(thermSensors.getTempC(therm_sensor_address)); 
      
      Serial.println("");

      doc["ot"].add(ot_obj);

      ot_obj["i"] = String(i);
//      ot_obj["ot_addr"] = String(therm_sensor_address);
      ot_obj["t"] = String(thermSensors.getTempC(therm_sensor_address));
  
    }//if
  }//for


// ====================== SCAN BLE ===============================


// clear array
  miThermometer.resetData();
    
// Get sensor data - run BLE scan for <scanTime>
  unsigned bt_found = miThermometer.getData(scanTime); 

  if (bt_found==0)
    esp_restart();  // attempt to deal with "scan_evt timeout" problem (reset if BT scan completely failed )


  doc["bt_found"] = String(bt_found);
  doc["fl"] = String(firstLoop);

  doc["bt"].to<JsonArray>();    

  JsonObject bt_obj = doc["bt"].add<JsonObject>();
  doc["bt"].remove(0); // fix to avoid extra element in array

// miThermometer.bleDevices filled with bt devices data
  for (auto device : miThermometer.bleDevices) {

    doc["bt"].add(bt_obj);

    bt_obj["valid"] = (int) device.valid;
    bt_obj["name"] = device.name;
    bt_obj["addr"] = device.addr;
    bt_obj["rssi"] = device.rssi;
    bt_obj["suuid"] = device.serviceUUID;
    bt_obj["sdata"] = device.serviceData;
    bt_obj["mdata"] = device.manufacturerData;
/*
    Serial.printf("valid %d\n",  device.valid); // true for temp/hum sensors
    Serial.printf("name %s\n",  device.name.c_str());
    Serial.printf("addr %s\n",  device.addr.c_str());
    Serial.printf("rssi %d dBm\n",  device.rssi);
    Serial.printf("serviceUUID %s\n",  device.serviceUUID.c_str());  // 0x181a for temp/hum sensors
    Serial.printf("serviceData %s\n",  device.serviceData.c_str()); 
    Serial.printf("manufacturerData %s\n",  device.manufacturerData.c_str()); 
*/
    if (device.valid) { // if  temp/hum sensor

      bt_obj["t"] = device.temperature/100.0;
      bt_obj["h"] = device.humidity/100.0;
      bt_obj["bv"] = device.batt_voltage/1000.0;
      bt_obj["bl"] = device.batt_level;
/*
      Serial.printf("temperature %.2f C\n", device.temperature/100.0);
      Serial.printf("humidity %.2f %%\n", device.humidity/100.0);
      Serial.printf("battery voltage %.3f v\n",  device.batt_voltage/1000.0);
      Serial.printf("battery level %d %%\n",   device.batt_level);
*/         
    } else {
      bt_obj["t"] = "";
      bt_obj["h"] = "";
      bt_obj["bv"] = "";
      bt_obj["bl"] = "";
    }

  }//for

  Serial.print("BT devices found: ");  Serial.println(bt_found);


  delay(20); // attempt to avoid "scan_evt timeout" problem
  miThermometer.clearScanResults();  // Delete results from BLEScan buffer to release memory
  delay(20); // attempt to avoid "scan_evt timeout" problem

  Serial.println("Iteration " + String(count++) + " - Free heap is " + String(ESP.getFreeHeap()));

  String json;
  serializeJson(doc, json);

//serializeJsonPretty(doc, Serial);

// ====================== SEND DATA via WIFI ===============================


//  client.setCACert(test_root_ca);
  client.setInsecure();

  Serial.print("Connecting to HTTP server...");

  if (!client.connect(host, port))
    Serial.println("failed.");
  else {
    Serial.println("connected.");
      
    client.println("POST https://" + String(host) + ":" + String(port) + String(path) + " HTTP/1.0");
    client.println("Host: https://" + String(host));
    client.println("User-Agent: ESP");
    client.println("Connection: close");
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(json.length());
    client.println();
    client.println(json);

    unsigned long httpTimeout = millis();

    while (client.connected()) { 

      // avoid dead loop if there is no answer from server for more than 20 sec
      if (millis() - httpTimeout > 20000) {
        Serial.println("http server timeout!");
        client.stop();
        delay(60000);
        return;
      }

      String line = client.readStringUntil('\n'); //HTTP headers

      if (line == "\r") {
        Serial.println("headers received");
        Serial.println(line);
        break;
      }
    }//while

    String answer = client.readStringUntil('\n'); //payload first row

    Serial.println(answer);
        
    client.stop();


    DeserializationError err = deserializeJson(docIn, answer);

    if (err) {
      Serial.print(F("Answer deserialization failed with code: "));
      Serial.println(err.f_str());
    } else {
      auto reset = docIn["reset"].as<bool>();
      auto period = docIn["period"].as<int>();
      auto relay1 = docIn["relay1"].as<const char*>();
      auto relay2 = docIn["relay2"].as<const char*>();
      Serial.print("reset:"); Serial.println(String(reset));
      Serial.print("period:"); Serial.println(String(period));
      Serial.print("relay1:"); Serial.println(String(relay1));
      Serial.print("relay2:"); Serial.println(String(relay2)); 

// reset if server asked for it in it's json
      if (reset) {
        Serial.println("RESET");
        esp_restart();
      } else {
        
    }//if

    if (period!=0) {
      requestPeriod = period;
    } else {
      requestPeriod = REQUEST_PERIOD_DEFAULT;
    }

    Serial.print("Request period: ");
    Serial.println(requestPeriod);

// switch relay 1 if server asked for it in it's json 
    if (String(relay1)=="on")
      digitalWrite(relay1Pin, LOW);

    if (String(relay1)=="off")
      digitalWrite(relay1Pin, HIGH);

// switch relay 2 if server asked for it in it's json 
    if (String(relay2)=="on")
      digitalWrite(relay2Pin, LOW);

    if (String(relay2)=="off")
      digitalWrite(relay2Pin, HIGH);

    }//else


  }//else


  delay(100); 
  esp_sleep_enable_timer_wakeup(requestPeriod * 1000000); //light sleep for %requestPeriod% seconds

  esp_sleep_enable_ext1_wakeup( GPIO_SEL_26 | GPIO_SEL_33 , ESP_EXT1_WAKEUP_ANY_HIGH );  // 26 - PIR2 , 33 - PIR 1

  esp_wifi_stop();

  Serial.print("Sleeping... ");
  delay(100);


  esp_light_sleep_start();  


  gpio_wakeup = (log(esp_sleep_get_ext1_wakeup_status()))/log(2) ;
  Serial.print("Wake up, GPIO: ");
  Serial.println(gpio_wakeup);

  switch(gpio_wakeup) {
      case MOTION_SENSOR_1:
        motion_1 = true;
      break;
      case MOTION_SENSOR_2:
        motion_2 = true;
      break;
      case RSWITCH_SENSOR:
        rswitch = true;
      break;
     
  }//switch

  esp_wifi_start();

  count++; // global loop counter
  firstLoop = false;

}//loop

