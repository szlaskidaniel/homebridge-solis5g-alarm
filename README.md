<p align="center">
  <a href="https://github.com/homebridge/homebridge"><img src="https://raw.githubusercontent.com/homebridge/branding/master/logos/homebridge-color-round-stylized.png" height="140"></a>
</p>

<span align="center">

# homebridge-solis5g-alarm

[![npm](https://img.shields.io/npm/v/homebridge-solis5g-alarm.svg)](https://www.npmjs.com/package/homebridge-solis5g-alarm) [![npm](https://img.shields.io/npm/dt/homebridge-solis5g-alarm.svg)](https://www.npmjs.com/package/homebridge-solis5g-alarm)

</span>

## Description

This [homebridge](https://github.com/homebridge/homebridge) plugin read Alarm state from Solis5G inverter using local network and exposes it as a Switch Accessory to Apple's [HomeKit](http://www.apple.com/ios/home/). 
If Alarm is active, switch is ON, otherwise it's turned OFF.

## Installation

1. Install [homebridge](https://github.com/homebridge/homebridge#installation)
2. Install this plugin: `npm install -g homebridge-solis5g-battery`
3. Update your `config.json` file

## Configuration

```json
"accessories": [
     {
       "accessory": "Solis5gBattery",
       "name": "NoPower",  
       "url": "<URL to Your local Solis Inverter>",
       "username": "<username>",
       "password": "<password>"       
     }
]
```

### Core
| Key | Description | Default |
| --- | --- | --- |
| `accessory` | Must be `Solis5GAlarm` | N/A |
| `name` | Name to appear in the Home app | N/A |
| `url` | URL To Your Solis5G Inverter | N/A |
| `username` | Username that you use to open webPage from Solis Inverter | N/A |
| `password` | Passord that you use to open webPage from Solis Inverter | N/A |





### Additional options
| Key | Description | Default |
| --- | --- | --- |
| `pollInterval` | Time (in seconds) between device polls | `300` |
| `model` | Appears under the _Model_ field for the accessory | plugin |
| `serial` | Appears under the _Serial_ field for the accessory | `000-000-000-001` |
| `manufacturer` | Appears under the _Manufacturer_ field for the accessory | author |
| `firmware` | Appears under the _Firmware_ field for the accessory | version |


