let Service, Characteristic
const packageJson = require('./package.json')
const request = require('request')
const crypto = require('crypto');
const moment = require('moment');



module.exports = function (homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-solis5g-alarm', 'Solis5GAlarm', Solis5G)
}

function Solis5G (log, config) {
  this.log = log

  this.url = config.url;
  this.useCloud = config.useCloud;
  this.username = config.username;
  this.password = config.password;

  this.SOLIS_AUTH = {
    keyId: config.solis_keyid,
    secret: config.solis_secret,
    url: config.solis_url || 'https://www.soliscloud.com:13333'
  }

  this.name = config.name  
  this.pollInterval = config.pollInterval || 300
  this.solisDeviceSN = config.solis_deviceSN;
  this.lowBatteryTreshold = config.lowBatteryTreshold;
  this.powerPW = config.powerPW;
  
  
  this.manufacturer = config.manufacturer || packageJson.author
  this.serial = config.serial || '000-000-000-002'
  this.model = config.model || packageJson.name
  this.firmware = config.firmware || packageJson.version

  this.service = new Service.Switch(this.name);
  this.eventNoPower = new Service.MotionSensor('NoPowerEvent');
  
}

Solis5G.prototype = {

  identify: function (callback) {
    this.log('Identify requested!')
    callback()
  },

  _httpRequest: function (url, body, method, headers, callback) { 
    this.log.debug('_httpRequest', url);
   
    request({
      url: url,      
      method: method,      
      headers: headers,
      body: body
    },
    function (error, response, body) {
      callback(error, response, body)
    })
  },


  _getStatus: function (callback) {
    
    let headers, body;
    const resource = '/v1/api/alarmList';

    if (this.useCloud) {
      body = `{"alarmDeviceSn":"${this.solisDeviceSN}","pageNo":"1","pageSize":"10"}`;  
      let md = crypto.createHash("md5").update(body).digest();        
      const contentMd5 = Buffer.from(md).toString('base64')
      
      let date = moment().toDate().toUTCString();        
      let payload = `POST\n${contentMd5}\napplication/json\n${date}\n${resource}`;
      let options = {
        secret: this.SOLIS_AUTH.secret,
        message: payload
      }        
      let sign = hmacSha1(options);

      headers = {
        'Content-Type': 'application/json',
        'Authorization': `API ${this.SOLIS_AUTH.keyId}:${sign}`,
        'Date': date,            
        'Content-MD5': contentMd5
        };
    } else {
      const encodedAuth = Base64.encode(`${this.username}:${this.password}`);
      headers = 
        {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encodedAuth
        } 
    }
    
    this._httpRequest(this.useCloud ? this.SOLIS_AUTH.url + resource : this.url, body, this.useCloud ? 'POST' : 'GET', headers, function (error, response, responseBody) {      
      if (error) {
        this.log.warn('Error getting status: %s', error.message)
        this.service.getCharacteristic(Characteristic.On).updateValue(new Error('Polling failed'))
        callback(error)
      } else {
        try {   
          if (response?.statusCode !== 200) {
            console.log(response.message);
            this.log.warn(`Error HTTP ${response.statusCode}`);
            this.service.getCharacteristic(Characteristic.On).updateValue(new Error('Polling failed'));
            callback();
            return;
          }       
       
          this.log.debug('Device response: %s', responseBody);
          let activeAlarms;
          if (this.useCloud) {
            this.log.debug('verify alarms from cloud response...');
            let json = JSON.parse(responseBody);
            activeAlarms = json.data.records.filter( (x) => x.state === "0" && (x.alarmCode === "186E4" || x.alarmCode === "186E6")).length;            
            this.log.debug('activeAlarms (186E4 / 186E6) from cloud:', activeAlarms);
            activeAlarms = activeAlarms > 0 ? 0 : 1; // reverse logic

          } else {
            this.log.debug('verify alarms locally...');
            activeAlarms = responseBody.indexOf('var webdata_alarm = ""');
          }
          
          //const value = this.homebridgeService.getCharacteristic(Characteristic.On).value; // read it from the cache
          if (activeAlarms > 0) {                        
            this.log.debug('Device ok. No alarm found');
            this.service.getCharacteristic(Characteristic.On).updateValue(0);
          } else { 
            this.log.warn('Device in alarm mode');
            this.service.getCharacteristic(Characteristic.On).updateValue(1);   
            
            // Execute MotionEvent
            this.eventNoPower.getCharacteristic(Characteristic.MotionDetected).updateValue(1);
            sleep(10 * 1000).then(() => {
              this.eventNoPower.getCharacteristic(Characteristic.MotionDetected).updateValue(0);
            });

          }
              
     
          callback();
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

    return [this.informationService, this.service, this.eventNoPower];
  }

}

var Base64 = {

  // private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  // public method for encoding
  encode : function (input) {
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;

      input = Base64._utf8_encode(input);

      while (i < input.length) {

          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);

          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;

          if (isNaN(chr2)) {
              enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
              enc4 = 64;
          }

          output = output +
          this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
          this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
      }
      return output;
  },

  // public method for decoding
  decode : function (input) {
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;

      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      while (i < input.length) {

          enc1 = this._keyStr.indexOf(input.charAt(i++));
          enc2 = this._keyStr.indexOf(input.charAt(i++));
          enc3 = this._keyStr.indexOf(input.charAt(i++));
          enc4 = this._keyStr.indexOf(input.charAt(i++));

          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;

          output = output + String.fromCharCode(chr1);

          if (enc3 != 64) {
              output = output + String.fromCharCode(chr2);
          }
          if (enc4 != 64) {
              output = output + String.fromCharCode(chr3);
          }
      }

      output = Base64._utf8_decode(output);

      return output;
  },

  // private method for UTF-8 encoding
  _utf8_encode : function (string) {
      string = string.replace(/\r\n/g,"\n");
      var utftext = "";

      for (var n = 0; n < string.length; n++) {

          var c = string.charCodeAt(n);

          if (c < 128) {
              utftext += String.fromCharCode(c);
          }
          else if((c > 127) && (c < 2048)) {
              utftext += String.fromCharCode((c >> 6) | 192);
              utftext += String.fromCharCode((c & 63) | 128);
          }
          else {
              utftext += String.fromCharCode((c >> 12) | 224);
              utftext += String.fromCharCode(((c >> 6) & 63) | 128);
              utftext += String.fromCharCode((c & 63) | 128);
          }
      }
      return utftext;
  },

  // private method for UTF-8 decoding
  _utf8_decode : function (utftext) {
      var string = "";
      var i = 0;
      var c = c1 = c2 = 0;

      while ( i < utftext.length ) {

          c = utftext.charCodeAt(i);

          if (c < 128) {
              string += String.fromCharCode(c);
              i++;
          }
          else if((c > 191) && (c < 224)) {
              c2 = utftext.charCodeAt(i+1);
              string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
              i += 2;
          }
          else {
              c2 = utftext.charCodeAt(i+1);
              c3 = utftext.charCodeAt(i+2);
              string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
              i += 3;
          }
      }
      return string;
  }
}

function hmacSha1 (options) {
  return crypto.createHmac('sha1', options.secret).update(options.message).digest('base64')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
