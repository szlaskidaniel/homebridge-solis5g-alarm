let Service, Characteristic
const packageJson = require('./package.json')
const request = require('request')


module.exports = function (homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-solis5g-alarm', 'Solis5GAlarm', Solis5G)
}

function Solis5G (log, config) {
  this.log = log

  this.url = config.url;
  this.username = config.username;
  this.password = config.password;

  this.name = config.name  
  this.pollInterval = config.pollInterval || 300
  this.solisStationId = config.solis_stationId;
  this.lowBatteryTreshold = config.lowBatteryTreshold;
  this.powerPW = config.powerPW;
  
  
  this.manufacturer = config.manufacturer || packageJson.author
  this.serial = config.serial || '000-000-000-002'
  this.model = config.model || packageJson.name
  this.firmware = config.firmware || packageJson.version

  this.service = new Service.Switch(this.name);
  
}

Solis5G.prototype = {

  identify: function (callback) {
    this.log('Identify requested!')
    callback()
  },

  _httpRequest: function (url, username, password, headers, callback) { 
    this.log.debug('_httpRequest', url);
    request({
      url: url,      
      method: 'GET',
      auth: {
        user: username,
        password: password
      }      
    },
    function (error, response, body) {
      callback(error, response, body)
    })
  },


  _getStatus: function (callback) {
   
  
    const headers = {
      'Content-Type': 'application/json'    
    };

    
    
    this._httpRequest(this.url, this.username, this.password, headers, function (error, response, responseBody) {      
      if (error) {
        this.log.warn('Error getting status: %s', error.message)
        this.service.getCharacteristic(Characteristic.On).updateValue(new Error('Polling failed'))
        callback(error)
      } else {
        try {          
          if (response.statusCode === 401) {
            this.log.warn('Authentication failed');
            this.service.getCharacteristic(Characteristic.On).updateValue(new Error('Authentication failed'))
            callback(error);
            return;
          };
          
          //this.log.debug('Device response: %s', responseBody);

          this.log.debug('looking for var webdata_alarm = ""');
          const bAlarmFound = responseBody.indexOf('var webdata_alarm = ""');
          
          if (bAlarmFound > 0) {
            this.log.warn('Device in alarm mode');
            this.service.getCharacteristic(Characteristic.On).updateValue(0);
          } else { 
            this.log.debug('Alarm found');
            this.service.getCharacteristic(Characteristic.On).updateValue(1);
          }
                
          callback()
        } catch (e) {
          this.log.warn('Error parsing status: %s', e.message)
        }
      }
    }.bind(this))
  },


  getServices: function () {
    this.informationService = new Service.AccessoryInformation()
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.SerialNumber, this.serial)
      .setCharacteristic(Characteristic.FirmwareRevision, this.firmware)

    this._getStatus(function () {})
        

    setInterval(function () {
      this._getStatus(function () {})
    }.bind(this), this.pollInterval * 1000)

    return [this.informationService, this.service]
  }

}
