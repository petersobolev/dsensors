
// based on https://github.com/matthias-bs/ATC_MiThermometer
// scans all BLE devices, but only https://github.com/pvvx/ATC_MiThermometer (LYWSD03MMC with custom firmware) marked as valid and filled with t/h/v values

#include "ATC_MiThermometer.h"

uint16_t serviceUUID = 0x181A; // temp/hum service UUID

class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice* advertisedDevice) {

    if (advertisedDevice->haveServiceData()) {
      /* If this is a device with data we want to capture, add it to the whitelist */
      if (advertisedDevice->getServiceData(NimBLEUUID("181A")) != "") {
    
        NimBLEDevice::whiteListAdd(advertisedDevice->getAddress());
      }
    }
  }
};


constexpr char hexmap[] = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'};

std::string hexStr(std::string data)
{
  std::string s(data.length() * 2, ' ');
  for (int i = 0; i < data.length(); ++i) {
    s[2 * i]     = hexmap[(data[i] & 0xF0) >> 4];
    s[2 * i + 1] = hexmap[data[i] & 0x0F];
  }
  return s;
}

// Set up BLE scanning
// Runs in setup
void ATC_MiThermometer::begin(void)
{
    NimBLEDevice::init("");
    _pBLEScan = BLEDevice::getScan(); //create new scan
    _pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
    _pBLEScan->setActiveScan(true); //active scan uses more power, but get results faster. Also required for getting device name
    _pBLEScan->setInterval(_interval); // The scan interval (how often) in milliseconds. 100

    _pBLEScan->setFilterPolicy(BLE_HCI_SCAN_FILT_NO_WL);
    _pBLEScan->setWindow(_window);  // How long to actively scan. less or equal setInterval value. 99
    //_pBLEScan->setLimitedOnly(false);

}


// Get sensor data by running BLE device scan
// Runs in loop
unsigned ATC_MiThermometer::getData(uint32_t duration) {
    BLEScanResults foundDevices = _pBLEScan->start(duration, false /* is_continue */); // Start scanning and block until scanning has been completed.

    for (unsigned i=0; i<foundDevices.getCount(); i++) {
      bleDeviceStruct device {};
     
            if ( foundDevices.getDevice(i).getServiceDataUUID().equals(NimBLEUUID(serviceUUID)) ) {
                
                device.valid = true;
            
                int len = foundDevices.getDevice(i).getServiceData().length();
                
                if (len == 15) {
                   
                    // Temperature
                    int temp_msb = foundDevices.getDevice(i).getServiceData().c_str()[7];
                    int temp_lsb = foundDevices.getDevice(i).getServiceData().c_str()[6];
                    device.temperature = (temp_msb << 8) | temp_lsb;

                    // Humidity
                    int hum_msb = foundDevices.getDevice(i).getServiceData().c_str()[9];
                    int hum_lsb = foundDevices.getDevice(i).getServiceData().c_str()[8];
                    device.humidity = (hum_msb << 8) | hum_lsb;

                    // Battery voltage
                    int volt_msb = foundDevices.getDevice(i).getServiceData().c_str()[11];
                    int volt_lsb = foundDevices.getDevice(i).getServiceData().c_str()[10];
                    device.batt_voltage = (volt_msb << 8) | volt_lsb;

                    // Battery state [%]
                    device.batt_level = foundDevices.getDevice(i).getServiceData().c_str()[12];         
                } else if (len == 13) {
                    // ATC1441 format
                    
                    // Temperature
                    int temp_lsb = foundDevices.getDevice(i).getServiceData().c_str()[7];
                    int temp_msb = foundDevices.getDevice(i).getServiceData().c_str()[6];
                    device.temperature  = (temp_msb << 8) | temp_lsb;
                    device.temperature *= 10;

                    // Humidity
                    device.humidity  = foundDevices.getDevice(i).getServiceData().c_str()[8];
                    device.humidity *= 100;

                    // Battery voltage
                    int volt_lsb = foundDevices.getDevice(i).getServiceData().c_str()[11];
                    int volt_msb = foundDevices.getDevice(i).getServiceData().c_str()[10];
                    device.batt_voltage = (volt_msb << 8) | volt_lsb;

                    // Battery state [%]
                    device.batt_level = foundDevices.getDevice(i).getServiceData().c_str()[9];
                }//if 

            }//if     
            
            device.rssi = foundDevices.getDevice(i).getRSSI();
            device.name = foundDevices.getDevice(i).getName();
            device.addr = foundDevices.getDevice(i).getAddress().toString();
            device.serviceUUID = foundDevices.getDevice(i).getServiceDataUUID().toString();
            device.serviceData = hexStr(foundDevices.getDevice(i).getServiceData());
            device.manufacturerData = hexStr(foundDevices.getDevice(i).getManufacturerData());

            bleDevices.push_back(bleDeviceStruct( { device.valid, device.temperature, device.humidity, device.batt_voltage, device.batt_level, device.rssi, device.name, device.addr, device.serviceUUID, device.serviceData, device.manufacturerData } ) );
            
        }//for
//    }
    return foundDevices.getCount();
}

        
// Clear array before next scan
void ATC_MiThermometer::resetData(void)
{

    bleDevices.clear();

}
