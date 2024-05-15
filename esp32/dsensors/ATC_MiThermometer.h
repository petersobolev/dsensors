
// Bluetooth low energy thermometer/hygrometer sensor client for MCUs supported by NimBLE-Arduino.
// For sensors running ATC_MiThermometer firmware (see https://github.com/pvvx/ATC_MiThermometer)
//
// https://github.com/matthias-bs/ATC_MiThermometer
//

#ifndef ATC_MiThermometer_h
#define ATC_MiThermometer_h

#include <Arduino.h>
#include <NimBLEDevice.h>


struct bleDeviceStruct {
        bool        valid;          //!< data valid
        int16_t     temperature;    //!< temperature x 100°C
        uint16_t    humidity;       //!< humidity x 100%
        uint16_t    batt_voltage;   //!< battery voltage [mv]
        uint8_t     batt_level;     //!< battery level   [%]
        int16_t     rssi;           //!< RSSI [dBm]
        std::string      name;
        std::string      addr;
        std::string      serviceUUID;
        std::string      serviceData;
        std::string      manufacturerData;
};


class ATC_MiThermometer {
    public:


        ATC_MiThermometer(int interval, int window) { 
          _interval = interval;
          _window = window;
        };

        void begin(void);
        
        void clearScanResults(void) {
            _pBLEScan->clearResults();
        };
       

        unsigned getData(uint32_t duration);
        
        void resetData(void);
        
        std::vector<bleDeviceStruct>  bleDevices;

        
        
    protected:
        int _interval;
        int _window;
        NimBLEScan*              _pBLEScan;
};
#endif
